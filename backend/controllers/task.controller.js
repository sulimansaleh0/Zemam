const Task = require("../models/task.model")
const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus } = require("../data/status")
const { getDriverVehicleEligibilityError } = require("../utils/driverEligibility")

exports.createTask = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { title, description, driverId, vehicleId, startTime, expectedEndTime, startOdometer, pickupLocation, deliveryLocation } = req.body
    try {
        let vehicleFilters = { _id: vehicleId, companyId: user.companyId, status: mainStatus.ACTIVE, isDeleted: false };
        if (teamId) vehicleFilters.teamId = teamId;

        const vehicle = await Vehicle.findOne(vehicleFilters)
        if (!vehicle) return error(res, 404, "Vehicle not found")
        if (vehicle.isInTask) return error(res, 409, "Vehicle is already assigned to an active task")

        const assignedDriverId = driverId || vehicle.driverId
        if (!assignedDriverId) return error(res, 400, "Driver id is required when the vehicle has no driver")

        const driver = await User.findOne({
            _id: assignedDriverId,
            companyId: user.companyId,
            status: mainStatus.ACTIVE,
            isDeleted: false
        })
        if (!driver) return error(res, 404, "Driver not found")
        const driverHasActiveTask = await Task.exists({
            driverId: assignedDriverId,
            companyId: user.companyId,
            status: taskStatus.INPROGRESS
        })
        if (driverHasActiveTask) return error(res, 409, "Driver already has an active task")

        if (driver.role !== userRoles.DRIVER) return error(res, 400, "User should be a driver")
        if (!driver.teamId || !vehicle.teamId || vehicle.teamId.toString() !== driver.teamId.toString())
            return error(res, 400, "Driver and Vehicle should be in the same team")

        const eligibilityError = getDriverVehicleEligibilityError(driver, vehicle)
        if (eligibilityError) return error(res, 400, eligibilityError)

        const effectiveTeamId = teamId || driver.teamId;

        const task = await Task.create({
            title,
            description,
            vehicleId,
            driverId: assignedDriverId,
            startTime,
            expectedEndTime: expectedEndTime || startTime,
            startOdometer: startOdometer ?? vehicle.currentOdometer,
            pickupLocation,
            deliveryLocation,
            teamId: effectiveTeamId,
            companyId: user.companyId
        })
        const populatedTask = await Task.findById(task._id)
            .populate("driverId", "name email phone avatar")
            .populate("vehicleId", "plateNumber model year type status isInTask")
            .populate("teamId", "name")
        success(res, 201, { task: populatedTask })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listTasks = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    try {
        const filters = { companyId: user.companyId }
        if (teamId) filters.teamId = teamId
        const tasks = await Task.find(filters)
            .populate("driverId", "name email phone avatar")
            .populate("vehicleId", "plateNumber model year type status isInTask")
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
        success(res, 200, { tasks })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listDriverTasks = async (req, res) => {
    const user = req.user
    try {
        const tasks = await Task.find({ driverId: user._id, companyId: user.companyId })
            .populate("vehicleId", "plateNumber model year type status isInTask")
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
        success(res, 200, { tasks })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listTask = async (req, res) => {
    const user = req.user
    const id = req.params.id
    if (!id) return error(res, 400, "task id is required")
    try {
        const filters = { _id: id, companyId: user.companyId }
        if (user.teamId) filters.teamId = user.teamId
        const task = await Task.findOne(filters)
            .populate("driverId", "name email phone avatar")
            .populate("vehicleId", "plateNumber model year type status isInTask")
            .populate("teamId", "name")
        if (!task) return error(res, 404, "Task not found")
        success(res, 200, { task })
    } catch (err) {
        console.log(err)
        serverError(res)
    }

}

exports.updateTask = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { title, description, driverId, vehicleId, startTime, expectedEndTime, startOdometer, pickupLocation, deliveryLocation } = req.body
    const taskId = req.params.id || null
    if (!taskId) return error(res, 400, "task id is required")
    try {
        const taskFilters = { _id: taskId, companyId: user.companyId }
        if (teamId) taskFilters.teamId = teamId
        const task = await Task.findOne(taskFilters)
        if (!task) return error(res, 404, "task not found")

        if (!(task.status === taskStatus.PENDING)) return error(res, 400, "cant update this task")

        let driver;
        let vehicle;
        const teamFilters = teamId ? { teamId } : {}
        if (driverId)
            driver = await User.findOne({ _id: driverId, companyId: user.companyId, ...teamFilters, role: userRoles.DRIVER })
        if (vehicleId)
            vehicle = await Vehicle.findOne({ _id: vehicleId, companyId: user.companyId, ...teamFilters })

        // validate driver
        if (driverId) {
            if (!driver) return error(res, 400, "driver not found")
            if (driver.role !== userRoles.DRIVER) return error(res, 400, "user should be a driver")
            if (!(driver.status === mainStatus.ACTIVE)) return error(res, 400, "Driver is not active")
        }

        // validate vehicle
        if (vehicleId) {
            if (!vehicle) return error(res, 400, "Vehicle not found")
            if (!(vehicle.status === mainStatus.ACTIVE)) return error(res, 400, "Vehicle is not active")
        }

        const nextDriverId = driverId || task.driverId
        const nextVehicleId = vehicleId || task.vehicleId
        const [nextDriver, nextVehicle] = await Promise.all([
            driver || User.findOne({ _id: nextDriverId, companyId: user.companyId, isDeleted: false }),
            vehicle || Vehicle.findOne({ _id: nextVehicleId, companyId: user.companyId, isDeleted: false })
        ])
        if (!nextDriver || !nextVehicle) return error(res, 400, "Driver or vehicle not found")
        if (nextVehicle.isInTask) return error(res, 409, "Vehicle is already assigned to an active task")
        if (!nextDriver.teamId || !nextVehicle.teamId || nextDriver.teamId.toString() !== nextVehicle.teamId.toString())
            return error(res, 400, "Driver and Vehicle should be in the same team")

        const eligibilityError = getDriverVehicleEligibilityError(nextDriver, nextVehicle)
        if (eligibilityError) return error(res, 400, eligibilityError)
        if (title !== undefined) task.title = title
        if (description !== undefined) task.description = description
        if (startTime !== undefined) task.startTime = startTime
        if (expectedEndTime !== undefined) task.expectedEndTime = expectedEndTime
        if (startOdometer !== undefined) task.startOdometer = startOdometer
        if (pickupLocation !== undefined) task.pickupLocation = pickupLocation
        if (deliveryLocation !== undefined) task.deliveryLocation = deliveryLocation
        task.driverId = nextDriverId
        task.vehicleId = nextVehicleId
        await task.save()
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.acceptTask = async (req, res) => {
    const user = req.user
    const id = req.params.id || null
    if (!id) return error(res, 400, "Task id is required")
    try {
        const task = await Task.findOne({
            _id: id,
            companyId: user.companyId,
            teamId: user.teamId,
            driverId: user._id
        })
        if (!task) return error(res, 404, "Task not found")

        if (!(task.status === taskStatus.PENDING)) return error(res, 400, "Cant accept this task")
        if (new Date() < task.startTime) return error(res, 400, "You cannot accept this task before its start time")
        const vehicle = await Vehicle.findOne({
            _id: task.vehicleId,
            companyId: user.companyId,
            status: mainStatus.ACTIVE,
            isDeleted: false,
            isInTask: false
        })
        if (!vehicle) return error(res, 409, "Vehicle is unavailable for this task")
        const vehicleUpdate = await Vehicle.updateOne(
            { _id: vehicle._id, isInTask: false },
            { $set: { isInTask: true } }
        )
        if (!vehicleUpdate.modifiedCount) return error(res, 409, "Vehicle is unavailable for this task")
        task.status = taskStatus.INPROGRESS
        task.startedAt = new Date()
        await task.save()
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.finishTask = async (req, res) => {
    const user = req.user
    const id = req.params.id || null
    if (!id) return error(res, 400, "Task id is required")
    try {
        const task = await Task.findOne({
            _id: id,
            companyId: user.companyId,
            teamId: user.teamId,
            driverId: user._id
        })
        if (!task) return error(res, 404, "Task not found")

        if (!(task.status === taskStatus.INPROGRESS)) return error(res, 400, "Task is not in progress")

        const vehicle = await Vehicle.findById(task.vehicleId)
        if (!vehicle) return error(res, 404, "Vehicle not found")
        const finishedAt = new Date()
        const endOdometer = req.body.endOdometer === undefined ? vehicle.currentOdometer : Number(req.body.endOdometer)
        if (!Number.isFinite(endOdometer)) return error(res, 400, "End odometer must be a valid number")
        if (endOdometer !== undefined && endOdometer < (task.startOdometer ?? vehicle.currentOdometer)) {
            return error(res, 400, "End odometer cannot be lower than the start odometer")
        }
        const expectedEndTime = task.expectedEndTime || task.startTime
        const deadline = new Date(expectedEndTime.getTime() + 15 * 60 * 1000)
        const delayed = finishedAt > deadline
        task.status = taskStatus.FINISHED
        task.finishedAt = finishedAt
        task.endOdometer = endOdometer
        task.isDelayed = delayed
        await task.save()

        const vehicleUpdate = { isInTask: false }
        vehicleUpdate.currentOdometer = endOdometer
        await Vehicle.findByIdAndUpdate(task.vehicleId, vehicleUpdate)
        const driverUpdate = {
            $inc: { totalTasksCompleted: 1 },
            $push: delayed ? { scoreHistory: { pointsChange: -4, reason: "Task completed after the 15 minute grace period", category: "task", relatedId: task._id } } : { scoreHistory: { pointsChange: 1, reason: "Task completed on time", category: "task", relatedId: task._id } }
        }
        if (delayed) driverUpdate.$inc.delayedTasksCount = 1
        await User.findByIdAndUpdate(task.driverId, driverUpdate)
        await User.findOneAndUpdate({ _id: task.driverId, driverScore: { $gte: 0 } }, [
            { $set: { driverScore: { $max: [0, { $min: [100, { $add: ["$driverScore", delayed ? -4 : 1] }] }] } } }
        ])
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.declineTask = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const id = req.params.id || null
    if (!id) return error(res, 400, "Task id is required")
    try {
        let filters = { _id: id, companyId: user.companyId };
        if (teamId) filters.teamId = teamId;
        const task = await Task.findOne(filters)
        if (!task) return error(res, 404, "Task not found")

        if (![taskStatus.PENDING, taskStatus.INPROGRESS].includes(task.status)) {
            return error(res, 400, "Cant decline this task")
        }

        const { declineReason, reason } = req.body || {}
        task.declineReason = declineReason || reason || task.declineReason || "تم الإلغاء بواسطة الإدارة"
        task.status = taskStatus.DECLINED
        await task.save()

        await Vehicle.findByIdAndUpdate(task.vehicleId, { isInTask: false })

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
