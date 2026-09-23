const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const { success, error, serverError } = require("../utils/responses");
const { userRoles } = require("../data/roles");
const { taskStatus, mainStatus } = require("../data/status");

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
                } : {
                    lat: 24.7136,
                    lng: 46.6753,
                    speed: 0,
                    heading: 0,
                    updatedAt: new Date().toISOString()
                },
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
 * GET /api/gps/trip-summary/:taskId
 * Fetches the permanent trip summary for a completed task
 */
exports.getTripSummary = async (req, res) => {
    const user = req.user;
    const { taskId } = req.params;
    const teamId = req.teamId;

    if (!taskId) {
        return error(res, 400, "Task ID is required");
    }

    try {
        const filters = {
            _id: taskId,
            companyId: user.companyId
        };

        if (teamId) {
            filters.teamId = teamId;
        }

        const task = await Task.findOne(filters)
            .populate("vehicleId", "plateNumber model year vehicleType")
            .populate("driverId", "name email phone avatar")
            .lean();

        if (!task) {
            return error(res, 404, "Task not found");
        }

        if (!task.tripSummary || !task.tripSummary.totalDistanceKm) {
            // Fallback for tasks completed without GPS telemetry points
            const fallbackSummary = {
                taskId: task._id.toString(),
                taskTitle: task.title,
                vehicleId: task.vehicleId?._id ? task.vehicleId._id.toString() : task.vehicleId?.toString(),
                plateNumber: task.vehicleId?.plateNumber,
                driverName: task.driverId?.name,
                totalDistanceKm: Math.max(0, (task.endOdometer || 0) - (task.startOdometer || 0)),
                durationMinutes: task.startedAt && task.finishedAt
                    ? Math.max(1, Math.round((new Date(task.finishedAt).getTime() - new Date(task.startedAt).getTime()) / 60000))
                    : 0,
                averageSpeed: 0,
                maxSpeed: 0,
                startLocation: {
                    lat: parseFloat(task.pickupLocation?.lat) || 0,
                    lng: parseFloat(task.pickupLocation?.lng) || 0,
                    address: task.pickupLocation?.address || ""
                },
                endLocation: {
                    lat: parseFloat(task.deliveryLocation?.lat) || 0,
                    lng: parseFloat(task.deliveryLocation?.lng) || 0,
                    address: task.deliveryLocation?.address || ""
                },
                encodedPath: "",
                startedAt: task.startedAt ? new Date(task.startedAt).toISOString() : new Date().toISOString(),
                finishedAt: task.finishedAt ? new Date(task.finishedAt).toISOString() : new Date().toISOString()
            };

            return success(res, 200, { summary: fallbackSummary });
        }

        const summaryWithMeta = {
            taskId: task._id.toString(),
            taskTitle: task.title,
            vehicleId: task.vehicleId?._id ? task.vehicleId._id.toString() : task.vehicleId?.toString(),
            plateNumber: task.vehicleId?.plateNumber,
            driverName: task.driverId?.name,
            ...task.tripSummary
        };

        return success(res, 200, { summary: summaryWithMeta });
    } catch (err) {
        console.error("❌ [GPS Controller] Error fetching trip summary:", err);
        return serverError(res);
    }
};

/**
 * GET /api/gps/history/:vehicleId
 * Fetches recent trip summaries for a specific vehicle
 */
exports.getVehicleHistory = async (req, res) => {
    const user = req.user;
    const { vehicleId } = req.params;
    const teamId = req.teamId;
    if (!vehicleId) {
        return error(res, 400, "Vehicle ID is required");
    }

    try {
        const vehicleFilters = {
            _id: vehicleId,
            companyId: user.companyId,
            isDeleted: false
        };

        if (teamId) {
            vehicleFilters.teamId = teamId;
        }

        const vehicle = await Vehicle.findOne(vehicleFilters);
        if (!vehicle) {
            return error(res, 404, "Vehicle not found");
        }

        const tasks = await Task.find({
            vehicleId,
            companyId: user.companyId,
            status: taskStatus.FINISHED
        })
            .populate("driverId", "name email")
            .sort({ finishedAt: -1 })
            .limit(20)
            .lean();

        const trips = tasks.map((t) => {
            if (t.tripSummary) {
                return {
                    taskId: t._id.toString(),
                    taskTitle: t.title,
                    vehicleId: vehicleId.toString(),
                    plateNumber: vehicle.plateNumber,
                    driverName: t.driverId?.name,
                    ...t.tripSummary
                };
            }

            // Fallback for tasks with odometer only
            return {
                taskId: t._id.toString(),
                taskTitle: t.title,
                vehicleId: vehicleId.toString(),
                plateNumber: vehicle.plateNumber,
                driverName: t.driverId?.name,
                totalDistanceKm: Math.max(0, (t.endOdometer || 0) - (t.startOdometer || 0)),
                durationMinutes: t.startedAt && t.finishedAt
                    ? Math.max(1, Math.round((new Date(t.finishedAt).getTime() - new Date(t.startedAt).getTime()) / 60000))
                    : 0,
                averageSpeed: 0,
                maxSpeed: 0,
                startLocation: {
                    lat: parseFloat(t.pickupLocation?.lat) || 0,
                    lng: parseFloat(t.pickupLocation?.lng) || 0,
                    address: t.pickupLocation?.address || ""
                },
                endLocation: {
                    lat: parseFloat(t.deliveryLocation?.lat) || 0,
                    lng: parseFloat(t.deliveryLocation?.lng) || 0,
                    address: t.deliveryLocation?.address || ""
                },
                encodedPath: "",
                startedAt: t.startedAt ? new Date(t.startedAt).toISOString() : new Date().toISOString(),
                finishedAt: t.finishedAt ? new Date(t.finishedAt).toISOString() : new Date().toISOString()
            };
        });

        return success(res, 200, { trips });
    } catch (err) {
        console.error("❌ [GPS Controller] Error fetching vehicle history:", err);
        return serverError(res);
    }
};
