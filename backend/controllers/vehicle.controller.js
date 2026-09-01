const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const Team = require("../models/team.model")
const { userRoles } = require("../data/roles")
const { mainStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")

exports.createVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { model, year, plateNumber, driverId } = req.body
    try {
        const assignedTeamId = user.role === userRoles.FLEET_MANAGER ? user.teamId : (teamId || null)

        const existingVehicle = await Vehicle.findOne({
            plateNumber,
            companyId: user.companyId,
            isDeleted: false
        })
        if (existingVehicle) {
            return error(res, 400, "رقم اللوحة مسجل بالفعل لمركبة أخرى في الشركة")
        }

        let driver = null
        if (driverId) {
            let driverFilters = { _id: driverId, companyId: user.companyId, role: userRoles.DRIVER, isDeleted: false }
            if (assignedTeamId) driverFilters.teamId = assignedTeamId

            driver = await User.findOne(driverFilters)
            if (!driver) return error(res, 404, "Driver not found or does not belong to the selected team")
            if (driver.status !== mainStatus.ACTIVE) return error(res, 400, "Driver is not active")

            // Unlink driver from previous vehicle
            await Vehicle.updateMany({ driverId: driver._id, companyId: user.companyId }, { driverId: null })
        }

        const vehicle = await Vehicle.create({
            model,
            year,
            plateNumber,
            teamId: assignedTeamId,
            companyId: user.companyId,
            driverId: driver ? driver._id : null
        })

        const populated = await Vehicle.findById(vehicle._id)
            .populate("driverId", "name email phone status")
            .populate("teamId", "name")

        success(res, 201, { vehicle: populated })
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

        if (teamId)
            filters.teamId = teamId
        else if (withoutTeam === "true" && !user.teamId)
            filters.teamId = null

        const vehicles = await Vehicle.find(filters)
            .populate("driverId", "name email phone status")
            .populate("teamId", "name")

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
        let filters = {
            _id: id,
            companyId: user.companyId,
            isDeleted: false
        }
        if (teamId) filters.teamId = teamId;

        const vehicle = await Vehicle.findOne(filters)
            .populate("driverId", "name email phone status")
            .populate("teamId", "name")

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
    if (!teamId) return error(res, 400, "Team Id is required")
    try {
        const team = await Team.findOne({ _id: teamId, companyId, isDeleted: false })
        if (!team) return error(res, 404, "Team not found")

        const vehicle = await Vehicle.findOne({ _id: vehicleId, companyId, isDeleted: false })
        if (!vehicle) return error(res, 404, "Vehicle not found")

        // If vehicle changes team, clear assigned driver if driver was from old team
        if (vehicle.teamId && vehicle.teamId.toString() !== teamId.toString()) {
            vehicle.driverId = null
        }

        vehicle.teamId = teamId
        await vehicle.save()
        success(res, 200)
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
        success(res, 200)
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
        let filters = {
            _id: id,
            companyId: user.companyId,
        };
        if (teamId) filters.teamId = teamId;

        const vehicle = await Vehicle.findOneAndUpdate(filters, {
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
        let filters = {
            _id: vehicleId,
            companyId: user.companyId,
            isDeleted: false
        };
        if (teamId) filters.teamId = teamId;

        const existingVehicle = await Vehicle.findOne(filters)
        if (!existingVehicle) return error(res, 404, "Vehicle not found")
        if (existingVehicle.isInTask) return error(res, 400, "Cannot delete vehicle while in active task")

        if (user.role === userRoles.FLEET_MANAGER) {
            existingVehicle.teamId = null
            existingVehicle.driverId = null
            await existingVehicle.save()
            return success(res, 200, { message: "تمت إزالة المركبة من فريقك بنجاح ونقلها للمستودع العام" })
        }

        existingVehicle.isDeleted = true
        existingVehicle.driverId = null
        existingVehicle.teamId = null
        await existingVehicle.save()

        success(res, 200, { message: "تم حذف المركبة بنجاح" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}