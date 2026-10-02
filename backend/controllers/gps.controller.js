const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const { ingestBatchTelemetry } = require("../services/gpsIngestion.service");
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
