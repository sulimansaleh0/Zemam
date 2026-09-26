module.exports = (task, vehicle) => {
    return {
        taskId: task._id.toString(),
        taskTitle: task.title,
        vehicleId: vehicle._id.toString(),
        plateNumber: vehicle.plateNumber,
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
}