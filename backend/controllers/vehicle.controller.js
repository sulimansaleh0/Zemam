const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const { success, error, serverError } = require("../utils/responses")

exports.createVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { model, year, plateNumber, driverId } = req.body
    try {
        let driver
        if (teamId && driverId) {
            driver = await User.findOne({ _id: driverId, teamId, companyId: user.companyId })
            if (!driver) return error(res, 404, "Driver not found")
        }
        const vehicle = await Vehicle.create({
            model,
            year,
            plateNumber,
            teamId,
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
    const teamId = req.teamId
    const { withoutTeam } = req.query
    try {
        let filters = {
            companyId: user.companyId,
            isDeleted: false
        }

        if (filters.teamId)
            filters.teamId = teamId

        if (withoutTeam === "true" && !user.teamId)
            filters.teamId = null

        const vehicles = await Vehicle.find(filters)
        success(res, 200, { vehicles })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const id = req.params.id || null
    if (!id) return error(res, 400, "vehicle id is required")
    try {
        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: user.companyId,
            teamId,
        })
        if (!vehicle) return error(res, 404, "Vehicle not found")

        success(res, 200, { vehicle })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.setVehicleToTeam = async (req, res) => {
    const { companyId } = req.user
    const teamId = req.teamId
    const vehicleId = req.params.id
    if (!vehicleId) return error(res, 400, "Vehicle Id is required")
    try {
        const vehicle = await Vehicle.findOne({ _id: vehicleId, companyId, isDeleted: false })
        if (!vehicle) return error(res, 404, "Vehicle not found")
        if (vehicle.teamId) return error(res, 400, "Vehicle already in a team")

        vehicle.teamId = teamId
        await vehicle.save()
        success(res)
    } catch (err) {
        console.log(err)
        serverError(res)
    }

}

exports.removerVehicleFromTeam = async (req, res) => {
    const { companyId } = req.user
    const vehicleId = req.params.id
    if (!vehicleId) return error(res, 400, "Vehicle Id is required")
    try {
        const vehicle = await Vehicle.findOne({ _id: vehicleId, companyId, isDeleted: false })
        if (!vehicle) return error(res, 404, "Vehicle not found")
        if (!vehicle.teamId) return error(res, 400, "Vehicle is not in a team")

        vehicle.teamId = null
        vehicle.driverId = null
        await vehicle.save()
        success(res)
    } catch (err) {
        console.log(err)
        serverError(res)
    }

}

exports.changeVehicleStatus = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const id = req.params.id || null
    if (!id) return error(res, 400, "vehicle id is required")
    const { status } = req.body
    try {
        const vehicle = await Vehicle.findOneAndUpdate({
            _id: id,
            companyId: user.companyId,
            teamId
        }, {
            status
        })

        if (!vehicle) return error(res, 404, "Vehicle not found")

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.deleteVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const vehicleId = req.params.id
    if (!vehicleId) return error(res, 400, "Vehicle Id is required")
    try {
        const vehicle = await Vehicle.findOneAndUpdate({ _id: vehicleId, companyId: user.companyId, teamId }, { driverId: null, teamId: null, isDeleted: true })
        if (!vehicle) return error(res, 404, "Vehicle not found")
        success(res)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}