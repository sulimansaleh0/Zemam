const Task = require("../models/task.model")
const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus } = require("../data/status")

exports.createTask = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { title, description, driverId, vehicleId, startTime, pickupLocation, deliveryLocation } = req.body
    try {
        let vehicleFilters = { _id: vehicleId, companyId: user.companyId, status: mainStatus.ACTIVE, isDeleted: false };
        if (teamId) vehicleFilters.teamId = teamId;

        const vehicle = await Vehicle.findOne(vehicleFilters)
        if (!vehicle) return error(res, 404, "Vehicle not found")

        const assignedDriverId = driverId || vehicle.driverId
        if (!assignedDriverId) return error(res, 400, "Driver id is required when the vehicle has no driver")

        const driver = await User.findOne({
            _id: assignedDriverId,
            companyId: user.companyId,
            status: mainStatus.ACTIVE,
            isDeleted: false
        })
        if (!driver) return error(res, 404, "Driver not found")

        if (driver.role !== userRoles.DRIVER) return error(res, 400, "User should be a driver")
        if (!driver.teamId || !vehicle.teamId || vehicle.teamId.toString() !== driver.teamId.toString())
            return error(res, 400, "Driver and Vehicle should be in the same team")

        const effectiveTeamId = teamId || driver.teamId;

        const task = await Task.create({
            title,
            description,
            vehicleId,
            driverId: assignedDriverId,
            startTime,
            pickupLocation,
            deliveryLocation,
            teamId: effectiveTeamId,
            companyId: user.companyId
        })
        success(res, 201, { task })
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
        success(res, 200, { tasks })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listDriverTasks = async (req, res) => {
    const user = req.user
    try {
        const tasks = await Task.find({ driverId: user._id, status: taskStatus.PENDING })
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
    const { title, description, driverId, vehicleId, startTime, pickupLocation, deliveryLocation } = req.body
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
            driver || User.findOne({ _id: nextDriverId, companyId: user.companyId }),
            vehicle || Vehicle.findOne({ _id: nextVehicleId, companyId: user.companyId })
        ])
        if (!nextDriver.teamId || !nextVehicle.teamId || nextDriver.teamId.toString() !== nextVehicle.teamId.toString())
            return error(res, 400, "Driver and Vehicle should be in the same team")

        if (title !== undefined) task.title = title
        if (description !== undefined) task.description = description
        if (startTime !== undefined) task.startTime = startTime
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

        await Task.findByIdAndUpdate(id, { status: taskStatus.INPROGRESS, startedAt: new Date() })
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

        await Task.findByIdAndUpdate(id, { status: taskStatus.FINISHED, finishedAt: new Date() })
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

        if (task.status === taskStatus.FINISHED) return error(res, 400, "Cant decline a finished task")

        await Task.findByIdAndUpdate(id, { status: taskStatus.DECLINED })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

