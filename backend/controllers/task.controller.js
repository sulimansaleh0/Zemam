const Task = require("../models/task.model")
const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus } = require("../data/status")

exports.createTask = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { description, driverId, vehicleId } = req.body
    try {
        const [driver, vehicle] = await Promise.all([
            User.findOne({ _id: driverId, companyId: user.companyId, teamId, status: mainStatus.ACTIVE, isDeleted: false }),
            Vehicle.findOne({ _id: vehicleId, companyId: user.companyId, teamId, status: mainStatus.ACTIVE, isDeleted: false })
        ])
        if (!driver) return error(res, 404, "User not found")
        if (!vehicle) return error(res, 404, "Vehicle not found")

        if (driver.role !== userRoles.DRIVER) return error(res, 400, "User should be a driver")
        if (vehicle.teamId.toString() !== driver.teamId.toString())
            return error(res, 400, "Driver and Vehicle should be in the same team")

        const task = await Task.create({
            description,
            vehicleId,
            driverId,
            teamId,
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
        const tasks = await Task.find({ companyId: user.companyId, teamId })
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
        const task = await Task.findById({ _id: id, companyId: user.companyId, teamId: user.teamId })
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
    const { description, driverId, vehicleId } = req.body
    const taskId = req.params.id || null
    if (!taskId) return error(res, 400, "task id is required")
    try {
        const task = await Task.findOne({ _id: taskId, companyId: user.companyId, teamId })
        if (!task) return error(res, 404, "task not found")

        if (!(task.status === taskStatus.PENDING)) return error(res, 400, "cant update this task")

        let driver;
        let vehicle;
        if (driverId)
            driver = await User.findOne({ _id: driverId, companyId: user.companyId, teamId: user.teamId })
        if (vehicleId)
            vehicle = await Vehicle.findOne({ _id: vehicleId, companyId: user.companyId, teamId: user.teamId })

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

        task.driverId = driverId || task.driverId
        task.vehicleId = vehicleId || task.vehicleId
        task.description = description || task.description
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
        const task = await Task.findOne({ _id: id, companyId: user.companyId, teamId: user.teamId })
        if (!task) return error(res, 404, "Task not found")

        if (!(task.status === taskStatus.PENDING)) return error(res, 400, "Cant accept this task")

        await Task.findByIdAndUpdate(id, { status: taskStatus.INPROGRESS })
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
        const task = await Task.findOne({ _id: id, companyId: user.companyId, teamId: user.teamId })
        if (!task) return error(res, 404, "Task not found")

        if (!(task.status === taskStatus.INPROGRESS)) return error(res, 400, "Task is not in progress")

        await Task.findByIdAndUpdate(id, { status: taskStatus.FINISHED })
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
        const task = await Task.findOne({ _id: id, copmanyId: user.companyId, teamId })
        if (!task) return error(res, 404, "Task not found")

        if (task.status === taskStatus.FINISHED) return error(res, 400, "Cant decline a finished task")

        await Task.findByIdAndUpdate(id, { status: taskStatus.DECLINED })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

