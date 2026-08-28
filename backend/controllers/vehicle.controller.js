const Vehicle = require("../models/vehicle.model")
const Team = require("../models/team.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")
const { mainStatus } = require("../data/status")
const { userRoles } = require("../data/roles")

exports.createVehicle = async (req, res) => {
    const user = req.user
    const { model, year, plateNumber, teamId, driverId } = req.body
    try {
        let team;
        if (user.teamId) {
            team = await Team.findOne({ _id: user.teamId, companyId: user.companyId })
            if (!team) return error(res, 404, "Team not found")
        } else if (teamId) {
            team = await Team.findOne({ _id: teamId, companyId: user.companyId })
            if (!team) return error(res, 404, "Team not found")
        }

        let driver
        if (team && driverId) {
            driver = await User.findOne({ _id: driverId, teamId: team._id, companyId: user.companyId })
            if (!driver) return error(res, 404, "Driver not found")
        }
        const vehicle = await Vehicle.create({
            model,
            year,
            plateNumber,
            teamId: team ? team._id : null,
            companyId: user.companyId,
            driverId: driver ? driver._id : null
        })
        success(res, 200, { vehicle })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listVehicles = async (req, res) => {
    const user = req.user
    const { teamId } = req.query || null
    try {
        let filters = {
            companyId: user.companyId
        }
        if (user.teamId)
            filters.teamId = user.teamId
        else if (teamId)
            filters.teamId = teamId

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
        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: user.companyId,
            teamId: user.teamId ? user.teamId : null
        })
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
        const vehicle = await Vehicle.findOneAndUpdate({
            _id: id,
            companyId: user.companyId,
            teamId: user.teamId
        }, {
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
        const [user, vehicle] = await Promise.all([
            User.findOne({ _id: driverId, companyId: fleetManager.companyId, teamId: fleetManager.teamId }),
            Vehicle.findOne({ _id: vehicleId, companyId: fleetManager.companyId, teamId: fleetManager.teamId })
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