const Vehicle = require("../models/vehicle.model")
const Team = require("../models/team.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")
const { mainStatus } = require("../data/status")
const { userRoles } = require("../data/roles")

exports.createVehicle = async (req, res) => {
    const user = req.user
    const { model, year, plateNumber } = req.body
    try {
        let teamId = user.teamId
        if (!teamId) {
            const firstTeam = await Team.findOne({ companyId: user.companyId })
            if (firstTeam) teamId = firstTeam._id
        }
        const vehicle = await Vehicle.create({
            model,
            year,
            plateNumber,
            teamId,
            companyId: user.companyId
        })
        success(res, 200, { vehicle })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listVehicles = async (req, res) => {
    const user = req.user
    try {
        let filters = { companyId: user.companyId }
        if (user.teamId) filters.teamId = user.teamId

        const vehicles = await Vehicle.find(filters)
        success(res, 200, { vehicles })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listVehicle = async (req, res) => {
    const user = req.user
    const id = req.params.id || null
    if (!id) return error(res, 400, "vehicle id is required")
    try {
        let filters = { _id: id, companyId: user.companyId }
        if (user.teamId) filters.teamId = user.teamId

        const vehicle = await Vehicle.findOne(filters)
        if (!vehicle) return error(res, 404, "Vehicle not found")

        success(res, 200, { vehicle })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.changeVehicleStatus = async (req, res) => {
    const user = req.user
    const { status } = req.body
    const id = req.params.id || null
    if (!id) return error(res, 400, "vehicle id is required")
    try {
        let filters = { _id: id, companyId: user.companyId }
        if (user.teamId) filters.teamId = user.teamId

        const vehicle = await Vehicle.findOneAndUpdate(filters, {
            status
        }, { returnDocument: "after" })

        if (!vehicle) return error(res, 404, "Vehicle not found")

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.assignDriver = async (req, res) => {
    const fleetManager = req.user

    const vehicleId = req.params.id
    if (!vehicleId) return error(res, 400, "vehicle id is required")

    const { driverId } = req.body
    if (!driverId) return error(res, 400, "user id is required")

    try {
        let userFilter = { _id: driverId, companyId: fleetManager.companyId }
        let vehicleFilter = { _id: vehicleId, companyId: fleetManager.companyId }
        if (fleetManager.teamId) {
            userFilter.teamId = fleetManager.teamId
            vehicleFilter.teamId = fleetManager.teamId
        }

        const [user, vehicle] = await Promise.all([
            User.findOne(userFilter),
            Vehicle.findOne(vehicleFilter)
        ])
        if (!user) return error(res, 404, "user not found")
        if (!vehicle) return error(res, 404, "vehicle not found")

        if (!user.roles.includes(userRoles.DRIVER))
            return error(res, 400, "User is not a driver")

        if (user.status !== mainStatus.ACTIVE)
            return error(res, 400, "Driver is not active")

        if (vehicle.status !== mainStatus.ACTIVE)
            return error(res, 400, "Vehicle is not active")

        vehicle.driverId = driverId
        await vehicle.save()
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}