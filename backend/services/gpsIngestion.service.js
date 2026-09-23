const mongoose = require("mongoose");
const Vehicle = require("../models/vehicle.model");
const Task = require("../models/task.model");
const TaskLivePoint = require("../models/taskLivePoint.model");
const { gpsStatus, taskStatus, vehicleStatus } = require("../data/status");

// In-memory cache of latest vehicle telemetry for rapid jitter filtering
const latestPositions = new Map();

/**
 * Calculates great-circle distance between two points on Earth using Haversine formula
 * @returns distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Google Polyline Algorithm (lossy compression for coordinate arrays)
 * Compresses an array of [lat, lng] pairs into a compact ASCII string
 */
function encodePolyline(points) {
    if (!points || !points.length) return "";

    let result = "";
    let prevLat = 0;
    let prevLng = 0;

    function encodeSignedNumber(num) {
        let sgn_num = num < 0 ? ~(num << 1) : (num << 1);
        let chunks = "";
        while (sgn_num >= 0x20) {
            chunks += String.fromCharCode((0x20 | (sgn_num & 0x1f)) + 63);
            sgn_num >>= 5;
        }
        chunks += String.fromCharCode(sgn_num + 63);
        return chunks;
    }

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const lat = Math.round(point[0] * 1e5);
        const lng = Math.round(point[1] * 1e5);

        const dLat = lat - prevLat;
        const dLng = lng - prevLng;

        prevLat = lat;
        prevLng = lng;

        result += encodeSignedNumber(dLat) + encodeSignedNumber(dLng);
    }

    return result;
}

/**
 * Confirms that the authenticated driver can report telemetry for this vehicle
 * and resolves the vehicle's current active task from the database.
 */
async function authorizeTelemetrySource({ vehicleId, taskId, driverId, companyId, teamId }) {
    if (!mongoose.isValidObjectId(vehicleId)) {
        throw new Error("Invalid vehicle");
    }

    const vehicle = await Vehicle.findOne({
        _id: vehicleId,
        companyId,
        teamId,
        status: vehicleStatus.ACTIVE,
        isDeleted: false,
        isInTask: true
    });

    if (!vehicle) {
        throw new Error("Vehicle is not available for an active task");
    }

    const activeTask = await Task.findOne({
        vehicleId: vehicle._id,
        driverId,
        companyId,
        teamId,
        status: taskStatus.INPROGRESS
    });

    if (!activeTask) {
        throw new Error("Vehicle has no active task");
    }

    if (taskId && (!mongoose.isValidObjectId(taskId) || activeTask._id.toString() !== taskId.toString())) {
        throw new Error("Task is not active or is not assigned to this driver and vehicle");
    }

    return {
        vehicle,
        taskId: activeTask?._id
    };
}

/**
 * Ingest incoming telemetry point from driver PWA or future hardware tracker
 */
async function processTelemetryUpdate({
    vehicleId,
    taskId,
    driverId,
    companyId,
    teamId,
    lat,
    lng,
    speed = 0,
    heading = 0,
    accuracy = 0,
    timestamp = Date.now()
}) {
    const numLat = Number(lat);
    const numLng = Number(lng);

    if (
        !Number.isFinite(numLat) ||
        !Number.isFinite(numLng) ||
        numLat < -90 ||
        numLat > 90 ||
        numLng < -180 ||
        numLng > 180
    ) {
        throw new Error("Invalid coordinates");
    }

    const authorizedSource = await authorizeTelemetrySource({
        vehicleId,
        taskId,
        driverId,
        companyId,
        teamId
    });
    const resolvedTaskId = authorizedSource.taskId;

    let numSpeed = Math.max(0, Number(speed) || 0);
    const numHeading = Math.max(0, Math.min(360, Number(heading) || 0));

    // Jitter filtering: check against previous reading
    const canonicalVehicleId = authorizedSource.vehicle._id.toString();
    const prev = latestPositions.get(canonicalVehicleId);
    let computedStatus = gpsStatus.AVAILABLE;

    if (prev) {
        const distKm = calculateHaversineDistance(prev.lat, prev.lng, numLat, numLng);
        // If movement is under 5 meters and speed under 3 km/h, vehicle is stationary / idle
        if (distKm < 0.005 && numSpeed < 3) {
            numSpeed = 0;
            computedStatus = resolvedTaskId ? gpsStatus.IDLE : gpsStatus.AVAILABLE;
        } else if (numSpeed >= 3 || distKm >= 0.005) {
            computedStatus = gpsStatus.MOVING;
        }
    } else {
        computedStatus = numSpeed >= 3 ? gpsStatus.MOVING : (resolvedTaskId ? gpsStatus.IDLE : gpsStatus.AVAILABLE);
    }

    const updateTime = new Date(timestamp);
    if (Number.isNaN(updateTime.getTime())) {
        throw new Error("Invalid timestamp");
    }

    // Update in-memory cache
    latestPositions.set(canonicalVehicleId, {
        lat: numLat,
        lng: numLng,
        speed: numSpeed,
        heading: numHeading,
        updatedAt: updateTime
    });

    // Update vehicle live state in MongoDB
    const vehicleUpdate = {
        currentLocation: {
            lat: numLat,
            lng: numLng,
            speed: Math.round(numSpeed * 10) / 10,
            heading: Math.round(numHeading),
            updatedAt: updateTime
        },
        gpsStatus: computedStatus
    };

    const updatedVehicle = await Vehicle.findOneAndUpdate(
        {
            _id: authorizedSource.vehicle._id,
            companyId,
            teamId,
            status: vehicleStatus.ACTIVE,
            isDeleted: false
        },
        { $set: vehicleUpdate },
        { new: true }
    )
        .populate("driverId", "name email phone avatar")
        .populate("teamId", "name");

    if (!updatedVehicle) {
        throw new Error("Vehicle is no longer available for telemetry");
    }

    // If active task, record in temporary high-resolution log (24h TTL)
    if (resolvedTaskId) {
        await TaskLivePoint.create({
            taskId: resolvedTaskId,
            vehicleId: authorizedSource.vehicle._id,
            driverId,
            companyId,
            teamId,
            lat: numLat,
            lng: numLng,
            speed: numSpeed,
            heading: numHeading,
            accuracy,
            timestamp: updateTime
        });
    }

    return {
        vehicle: updatedVehicle,
        telemetry: {
            vehicleId: updatedVehicle._id.toString(),
            plateNumber: updatedVehicle.plateNumber,
            model: updatedVehicle.model,
            year: updatedVehicle.year,
            vehicleType: updatedVehicle.vehicleType,
            teamId: updatedVehicle.teamId?._id ? updatedVehicle.teamId._id.toString() : updatedVehicle.teamId?.toString(),
            teamName: updatedVehicle.teamId?.name,
            driverId: updatedVehicle.driverId?._id ? updatedVehicle.driverId._id.toString() : updatedVehicle.driverId?.toString(),
            driverName: updatedVehicle.driverId?.name,
            driverPhone: updatedVehicle.driverId?.phone,
            driverAvatar: updatedVehicle.driverId?.avatar,
            currentLocation: {
                lat: numLat,
                lng: numLng,
                speed: Math.round(numSpeed * 10) / 10,
                heading: Math.round(numHeading),
                updatedAt: updateTime.toISOString()
            },
            gpsStatus: computedStatus,
            isInTask: !!resolvedTaskId,
            activeTaskId: resolvedTaskId ? resolvedTaskId.toString() : undefined
        }
    };
}

/**
 * Removes the in-memory tracking state after a task is finished.
 */
function stopTelemetryTracking(vehicleId) {
    if (vehicleId) {
        latestPositions.delete(vehicleId.toString());
    }
}

/**
 * Aggregates high-frequency raw points into a permanent, lightweight trip summary
 * and purges temporary raw points from database.
 */
async function finalizeTripSummary(taskId) {
    const task = await Task.findById(taskId);
    if (!task) return null;

    // Fetch all recorded points for this task, ordered by timestamp
    const points = await TaskLivePoint.find({ taskId }).sort({ timestamp: 1 });

    let totalDistanceKm = 0;
    let maxSpeed = 0;
    let speedSum = 0;
    let movingPointsCount = 0;
    const coordinatePairs = [];

    if (points && points.length > 0) {
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            coordinatePairs.push([p.lat, p.lng]);

            if (p.speed > maxSpeed) {
                maxSpeed = p.speed;
            }

            if (p.speed > 0) {
                speedSum += p.speed;
                movingPointsCount++;
            }

            if (i > 0) {
                const prev = points[i - 1];
                const legDist = calculateHaversineDistance(prev.lat, prev.lng, p.lat, p.lng);
                const elapsedHours = (new Date(p.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 3600000;
                const segmentSpeed = elapsedHours > 0 ? legDist / elapsedHours : 0;
                // Ignore GPS jitter and impossible jumps, but allow valid sparse updates.
                if (legDist > 0.002 && elapsedHours > 0 && segmentSpeed <= 180) {
                    totalDistanceKm += legDist;
                }
            }
        }
    }

    const startedAt = task.startedAt || (points.length > 0 ? points[0].timestamp : new Date());
    const finishedAt = task.finishedAt || new Date();
    const durationMs = Math.max(0, finishedAt.getTime() - new Date(startedAt).getTime());
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

    let averageSpeed = 0;
    if (movingPointsCount > 0) {
        averageSpeed = Math.round((speedSum / movingPointsCount) * 10) / 10;
    } else if (durationMinutes > 0 && totalDistanceKm > 0) {
        averageSpeed = Math.round((totalDistanceKm / (durationMinutes / 60)) * 10) / 10;
    }

    // Determine start and end locations
    let startLocation = {
        lat: points.length > 0 ? points[0].lat : (parseFloat(task.pickupLocation?.lat) || 0),
        lng: points.length > 0 ? points[0].lng : (parseFloat(task.pickupLocation?.lng) || 0),
        address: task.pickupLocation?.address || ""
    };

    let endLocation = {
        lat: points.length > 0 ? points[points.length - 1].lat : (parseFloat(task.deliveryLocation?.lat) || 0),
        lng: points.length > 0 ? points[points.length - 1].lng : (parseFloat(task.deliveryLocation?.lng) || 0),
        address: task.deliveryLocation?.address || ""
    };

    // Encode compressed polyline
    const encodedPath = encodePolyline(coordinatePairs);

    const tripSummary = {
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
        durationMinutes,
        averageSpeed,
        maxSpeed: Math.round(maxSpeed * 10) / 10,
        startLocation,
        endLocation,
        encodedPath,
        startedAt,
        finishedAt
    };

    // Save summary permanently to Task
    task.tripSummary = tripSummary;
    await task.save();

    // Immediately purge temporary raw points to save MongoDB space
    await TaskLivePoint.deleteMany({ taskId });

    return tripSummary;
}

module.exports = {
    calculateHaversineDistance,
    encodePolyline,
    stopTelemetryTracking,
    processTelemetryUpdate,
    finalizeTripSummary
};
