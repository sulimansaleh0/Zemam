const Task = require("../models/task.model")
const Team = require("../models/team.model")
const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus } = require("../data/status")
const validateDriver = require("../utils/validateDriver")
const validateVehicle = require("../utils/validateVehicle")

exports.createTask = async (req, res) => {
    const user = req.user
    const { description, driverId, vehicleId } = req.body
    try {
        const [driver, vehicle] = await Promise.all([
            User.findOne({ _id: driverId, companyId: user.companyId, teamId: user.teamId }),
            Vehicle.findOne({ _id: vehicleId, companyId: user.companyId, teamId: user.teamId })
        ])
        if (!driver) return error(res, 404, "User not found")
        if (!vehicle) return error(res, 404, "Vehicle not found")

        if (!driver.roles.includes(userRoles.DRIVER)) return error(res, 400, "User should be a driver")
        if (!(driver.status === mainStatus.ACTIVE)) return error(res, 400, "Driver not active")
        if (!(vehicle.status === mainStatus.ACTIVE)) return error(res, 400, "Vehicle not active")

        const task = await Task.create({
            description,
            vehicleId,
            driverId,
            teamId: user.teamId,
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
    try {
        const tasks = await Task.find({ companyId: user.companyId, teamId: user.teamId })
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
    const { description, driverId, vehicleId } = req.body
    const taskId = req.params.id || null
    if (!taskId) return error(res, 400, "task id is required")
    try {
        const task = await Task.findOne({ _id: taskId, companyId: user.companyId, teamId: user.teamId })
        if (!task) return error(res, 404, "task not found")

        if (!(task.status === taskStatus.PENDING)) return error(res, 400, "cant update this task")

        let driver;
        let vehicle;
        if (driverId)
            driver = await User.findOne({ _id: driverId, companyId: user.companyId, teamId: user.teamId })
        if (vehicleId)
            vehicle = await Vehicle.findOne({ _id: vehicleId, companyId: user.companyId, teamId: user.teamId })

        if (driverId)
            validateDriver(res, driver)

        if (vehicleId)
            validateVehicle(res, vehicle)

        task.driverId = driverId || task.driverId
        task.vehicleId = vehicleId || task.vehicleId
        task.description = description || task.description
        await task.save()
        success(true)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}