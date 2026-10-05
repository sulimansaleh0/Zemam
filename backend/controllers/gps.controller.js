const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const TaskLivePoint = require("../models/taskLivePoint.model");
const { ingestBatchTelemetry, finalizeTripSummary, encodePolyline } = require("../services/gpsIngestion.service");
const { success, error, serverError } = require("../utils/responses");
const { taskStatus, mainStatus } = require("../data/status");
const { userRoles } = require("../data/roles");

/**
 * GET /api/gps/live
 * Fetches all vehicles for the authenticated user's company/team
 * with current GPS coordinates and live task telemetry.
 */
exports.getLiveFleet = async (req, res) => {
    const user = req.user;
    const teamId = req.teamId;
    try {
        const filters = {
            companyId: user.companyId,
            teamId,
            status: mainStatus.ACTIVE,
            isDeleted: false
        };

        const [vehicles, activeTasks] = await Promise.all([
            Vehicle.find(filters)
                .populate("driverId", "name email phone avatar")
                .populate("teamId", "name")
                .lean(),
            Task.find({
                companyId: user.companyId,
                status: taskStatus.INPROGRESS
            }).lean()
        ]);

        // Map active tasks by vehicleId for quick telemetry lookup
        const activeTasksByVehicle = new Map();
        activeTasks.forEach((t) => {
            activeTasksByVehicle.set(t.vehicleId.toString(), {
                taskId: t._id.toString(),
                title: t.title
            });
        });

        const formattedVehicles = vehicles.map((v) => {
            const activeTask = activeTasksByVehicle.get(v._id.toString());
            const hasLocation = v.currentLocation && v.currentLocation.lat != null && v.currentLocation.lng != null;

            return {
                vehicleId: v._id.toString(),
                plateNumber: v.plateNumber,
                model: v.model,
                year: v.year,
                vehicleType: v.vehicleType,
                teamId: v.teamId?._id ? v.teamId._id.toString() : (v.teamId ? v.teamId.toString() : undefined),
                teamName: v.teamId?.name,
                driverId: v.driverId?._id ? v.driverId._id.toString() : (v.driverId ? v.driverId.toString() : undefined),
                driverName: v.driverId?.name,
                driverPhone: v.driverId?.phone,
                driverAvatar: v.driverId?.avatar,
                currentLocation: hasLocation ? {
                    lat: v.currentLocation.lat,
                    lng: v.currentLocation.lng,
                    speed: v.currentLocation.speed || 0,
                    heading: v.currentLocation.heading || 0,
                    updatedAt: v.currentLocation.updatedAt ? new Date(v.currentLocation.updatedAt).toISOString() : new Date().toISOString()
                } : null,
                gpsStatus: v.gpsStatus || "available",
                isInTask: !!activeTask || !!v.isInTask,
                activeTaskId: activeTask?.taskId,
                activeTaskTitle: activeTask?.title
            };

        });

        return success(res, 200, { vehicles: formattedVehicles });
    } catch (err) {
        console.error("❌ [GPS Controller] Error fetching live fleet:", err);
        return serverError(res);
    }
};

/**
 * POST /api/gps/telemetry/batch
 * Ingests a batch of telemetry points recorded while driver was offline
 */
exports.ingestBatchTelemetry = async (req, res) => {
    const user = req.user;
    const teamId = req.teamId;
    const { points } = req.body;

    if (user.role !== userRoles.DRIVER) {
        return error(res, 403, "Only drivers can upload telemetry batches");
    }

    if (!Array.isArray(points) || points.length === 0) {
        return error(res, 400, "A non-empty points array is required");
    }

    try {
        const result = await ingestBatchTelemetry({
            driverId: user._id,
            companyId: user.companyId,
            teamId,
            points
        });

        // Broadcast latest location to fleet tracking rooms
        if (result.latestTelemetry) {
            try {
                const { getIO } = require("../services/socket.service");
                const io = getIO();
                io.to(`company_${user.companyId}`).emit("vehicle:location_changed", result.latestTelemetry);
                if (teamId) {
                    io.to(`team_${teamId}`).emit("vehicle:location_changed", result.latestTelemetry);
                }
                // Notify task path updated
                if (result.latestTelemetry.activeTaskId) {
                    io.to(`company_${user.companyId}`).emit("task:path_synced", {
                        taskId: result.latestTelemetry.activeTaskId,
                        vehicleId: result.latestTelemetry.vehicleId,
                        syncedCount: result.processedCount
                    });
                }
            } catch (socketErr) {
                console.warn("[GPS Controller] Could not broadcast batch telemetry socket update:", socketErr.message);
            }
        }

        return success(res, 200, {
            message: `Successfully ingested ${result.processedCount} points (${result.droppedCount} outliers filtered)`,
            processedCount: result.processedCount,
            droppedCount: result.droppedCount
        });
    } catch (err) {
        console.error("❌ [GPS Controller] Error ingesting batch telemetry:", err);
        return error(res, 400, err.message || "Failed to ingest telemetry batch");
    }
};

/**
 * Helper to decode Google Polyline string back to array of coordinates
 */
function decodePolylinePoints(encoded) {
    if (!encoded || typeof encoded !== "string") return [];
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push({ lat: Math.round((lat / 1e5) * 1e5) / 1e5, lng: Math.round((lng / 1e5) * 1e5) / 1e5 });
    }
    return poly;
}

/**
 * GET /api/gps/trip-path/:taskId
 * Returns the recorded trajectory points and encoded path for an active or completed task
 */
exports.getLiveTripPath = async (req, res) => {
    const user = req.user;
    const { taskId } = req.params;

    if (!taskId || !mongoose.isValidObjectId(taskId)) {
        return error(res, 400, "Valid taskId is required");
    }

    try {
        const task = await Task.findOne({
            _id: taskId,
            companyId: user.companyId,
            ...(req.teamId ? { teamId: req.teamId } : {})
        });

        if (!task) {
            return error(res, 404, "Task not found");
        }

        // 1. Fetch live points from TaskLivePoint
        const livePoints = await TaskLivePoint.find({ taskId }).sort({ timestamp: 1 }).lean();

        let points = [];
        let encodedPath = "";

        if (livePoints.length > 0) {
            points = livePoints.map((p) => ({
                lat: p.lat,
                lng: p.lng,
                speed: p.speed || 0,
                heading: p.heading || 0,
                accuracy: p.accuracy || 0,
                timestamp: p.timestamp ? p.timestamp.getTime() : Date.now()
            }));
            encodedPath = encodePolyline(points.map((p) => [p.lat, p.lng]));
        } else if (task.tripSummary?.encodedPath) {
            encodedPath = task.tripSummary.encodedPath;
            const decoded = decodePolylinePoints(encodedPath);
            points = decoded.map((p) => ({
                lat: p.lat,
                lng: p.lng,
                speed: task.tripSummary.averageSpeed || 0,
                timestamp: task.startedAt ? new Date(task.startedAt).getTime() : Date.now()
            }));
        }

        return success(res, 200, {
            path: {
                taskId: task._id.toString(),
                vehicleId: task.vehicleId ? task.vehicleId.toString() : "",
                encodedPath,
                points
            }
        });
    } catch (err) {
        console.error("❌ [GPS Controller] Error fetching live trip path:", err);
        return serverError(res);
    }
};

/**
 * GET /api/gps/trip-summary/:taskId
 * Returns the trip summary for a finished task
 */
exports.getTripSummary = async (req, res) => {
    const user = req.user;
    const { taskId } = req.params;

    if (!taskId || !mongoose.isValidObjectId(taskId)) {
        return error(res, 400, "Valid taskId is required");
    }

    try {
        const task = await Task.findOne({
            _id: taskId,
            companyId: user.companyId,
            ...(req.teamId ? { teamId: req.teamId } : {})
        })
            .populate("vehicleId", "plateNumber model vehicleType")
            .populate("driverId", "name email phone avatar");

        if (!task) {
            return error(res, 404, "Task not found");
        }

        let summary = task.tripSummary;

        // If task is finished but tripSummary is missing or empty, generate it now
        if ((!summary || !summary.encodedPath) && task.status === taskStatus.FINISHED) {
            summary = await finalizeTripSummary(task);
        }

        if (!summary) {
            const fallBackTripSummary = require("../utils/fallBackTripSummary");
            summary = fallBackTripSummary(task, task.vehicleId || {});
        }

        return success(res, 200, {
            summary: {
                taskId: task._id.toString(),
                taskTitle: task.title,
                vehicleId: task.vehicleId?._id ? task.vehicleId._id.toString() : (task.vehicleId ? task.vehicleId.toString() : ""),
                plateNumber: task.vehicleId?.plateNumber || "",
                driverId: task.driverId?._id ? task.driverId._id.toString() : (task.driverId ? task.driverId.toString() : ""),
                driverName: task.driverId?.name || "",
                totalDistanceKm: summary.totalDistanceKm || 0,
                durationMinutes: summary.durationMinutes || 0,
                averageSpeed: summary.averageSpeed || 0,
                maxSpeed: summary.maxSpeed || 0,
                startLocation: summary.startLocation || {
                    lat: parseFloat(task.pickupLocation?.lat) || 0,
                    lng: parseFloat(task.pickupLocation?.lng) || 0,
                    address: task.pickupLocation?.address || ""
                },
                endLocation: summary.endLocation || {
                    lat: parseFloat(task.deliveryLocation?.lat) || 0,
                    lng: parseFloat(task.deliveryLocation?.lng) || 0,
                    address: task.deliveryLocation?.address || ""
                },
                encodedPath: summary.encodedPath || "",
                startedAt: summary.startedAt || task.startedAt,
                finishedAt: summary.finishedAt || task.finishedAt
            }
        });
    } catch (err) {
        console.error("❌ [GPS Controller] Error fetching trip summary:", err);
        return serverError(res);
    }
};

/**
 * GET /api/gps/history/:vehicleId
 * Returns completed trips history for a vehicle
 */
exports.getVehicleHistory = async (req, res) => {
    const user = req.user;
    const { vehicleId } = req.params;

    if (!vehicleId || !mongoose.isValidObjectId(vehicleId)) {
        return error(res, 400, "Valid vehicleId is required");
    }

    try {
        const tasks = await Task.find({
            vehicleId,
            companyId: user.companyId,
            ...(req.teamId ? { teamId: req.teamId } : {}),
            status: taskStatus.FINISHED
        })
            .sort({ finishedAt: -1 })
            .limit(20)
            .populate("vehicleId", "plateNumber model vehicleType")
            .populate("driverId", "name email phone avatar")
            .lean();

        const trips = tasks.map((t) => {
            const s = t.tripSummary || {};
            return {
                taskId: t._id.toString(),
                taskTitle: t.title,
                vehicleId: t.vehicleId?._id ? t.vehicleId._id.toString() : (t.vehicleId ? t.vehicleId.toString() : vehicleId),
                plateNumber: t.vehicleId?.plateNumber || "",
                driverName: t.driverId?.name || "",
                totalDistanceKm: s.totalDistanceKm || 0,
                durationMinutes: s.durationMinutes || 0,
                averageSpeed: s.averageSpeed || 0,
                maxSpeed: s.maxSpeed || 0,
                startLocation: s.startLocation || {
                    lat: parseFloat(t.pickupLocation?.lat) || 0,
                    lng: parseFloat(t.pickupLocation?.lng) || 0,
                    address: t.pickupLocation?.address || ""
                },
                endLocation: s.endLocation || {
                    lat: parseFloat(t.deliveryLocation?.lat) || 0,
                    lng: parseFloat(t.deliveryLocation?.lng) || 0,
                    address: t.deliveryLocation?.address || ""
                },
                encodedPath: s.encodedPath || "",
                startedAt: s.startedAt || t.startedAt,
                finishedAt: s.finishedAt || t.finishedAt
            };
        });

        return success(res, 200, { trips });
    } catch (err) {
        console.error("❌ [GPS Controller] Error fetching vehicle history:", err);
        return serverError(res);
    }
};
