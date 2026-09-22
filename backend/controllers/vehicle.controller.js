const Vehicle = require("../models/vehicle.model")
const User = require("../models/user.model")
const Maintenance = require("../models/maintenance.model")
const Task = require("../models/task.model")
const Fuel = require("../models/fuel.model")
const { userRoles } = require("../data/roles")
const { mainStatus, expenseRecordStatus, taskStatus, vehicleStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const { getDriverVehicleEligibilityError } = require("../utils/driverEligibility")
const { vehicleTypes } = require("../data/vehicleTypes")

exports.createVehicle = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    const { model, year, plateNumber, vehicleType, driverId, currentOdometer, expectedFuelEfficiency,
        tankCapacity, fuelType, licenseNumber, licenseExpiry, issuingAuthority,
        insuranceNumber, insuranceCompany, insuranceType, insuranceExpiry } = req.body
    const selectedVehicleType = vehicleType || vehicleTypes.NORMAL
    try {
        const existingVehicle = await Vehicle.findOne({
            plateNumber,
            companyId: user.companyId,
            isDeleted: false
        })
        if (existingVehicle) {
            return error(res, 400, "رقم اللوحة مسجل بالفعل لمركبة أخرى في الشركة")
        }

        let driver = null
        if (teamId && driverId) {
            let driverFilters = { _id: driverId, teamId, companyId: user.companyId, role: userRoles.DRIVER, isDeleted: false }

            driver = await User.findOne(driverFilters)
            if (!driver) return error(res, 404, "Driver not found or does not belong to the selected team")
            if (driver.status !== mainStatus.ACTIVE) return error(res, 400, "Driver is not active")

            const eligibilityError = getDriverVehicleEligibilityError(driver, { vehicleType: selectedVehicleType })
            if (eligibilityError) return error(res, 400, eligibilityError)

            // Unlink driver from previous vehicle
            await Vehicle.updateMany({ driverId: driver._id, companyId: user.companyId }, { driverId: null })
        }

        const vehicle = await Vehicle.create({
            model,
            year,
            plateNumber,
            vehicleType: selectedVehicleType,
            currentOdometer,
            expectedFuelEfficiency,
            tankCapacity,
            fuelType,
            licenseNumber,
            licenseExpiry,
            issuingAuthority,
            insuranceNumber,
            insuranceCompany,
            insuranceType,
            insuranceExpiry,
            teamId,
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
    const user = req.user;
    const teamId = req.teamId;
    const { withoutTeam } = req.query;
    try {
        let filters = {
            companyId: user.companyId,
            isDeleted: false
        };

        if (teamId)
            filters.teamId = teamId
        else if (withoutTeam === "true")
            filters.teamId = null

        const vehicles = await Vehicle.find(filters)
            .populate("driverId", "name email phone status")
            .populate("teamId", "name");

        success(res, 200, { vehicles });
    } catch (err) {
        console.log(err);
        serverError(res);
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

exports.updateVehicle = async (req, res) => {
    const user = req.user
    const updates = {}
    const allowedFields = ["model", "year", "plateNumber", "vehicleType", "currentOdometer",
        "expectedFuelEfficiency", "tankCapacity", "fuelType", "licenseNumber",
        "licenseExpiry", "issuingAuthority", "insuranceNumber", "insuranceCompany",
        "insuranceType", "insuranceExpiry"]
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) updates[field] = req.body[field]
    }
    try {
        const filters = { _id: req.params.id, companyId: user.companyId, isDeleted: false }
        if (req.teamId) filters.teamId = req.teamId
        if (updates.plateNumber) {
            const duplicate = await Vehicle.findOne({
                plateNumber: updates.plateNumber,
                companyId: user.companyId,
                isDeleted: false,
                _id: { $ne: req.params.id }
            })
            if (duplicate) return error(res, 400, "Plate number is already in use")
        }
        const vehicle = await Vehicle.findOneAndUpdate(filters, { $set: updates }, {
            new: true, runValidators: true
        })
        if (!vehicle) return error(res, 404, "Vehicle not found")
        success(res, 200, { vehicle })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.getVehicleStats = async (req, res) => {
    const user = req.user
    try {
        const filters = { _id: req.params.id, companyId: user.companyId, isDeleted: false }
        if (req.teamId) filters.teamId = req.teamId
        const vehicle = await Vehicle.findOne(filters).lean()
        if (!vehicle) return error(res, 404, "Vehicle not found")
        const [fuel, maintenance, tasks] = await Promise.all([
            Fuel.aggregate([
                { $match: { vehicleId: vehicle._id, status: expenseRecordStatus.APPROVED } },
                {
                    $group: {
                        _id: null, totalFuel: { $sum: "$qty" }, totalFuelCost: { $sum: "$cost" },
                        efficiencySum: { $sum: { $ifNull: ["$fuelEfficiency", 0] } },
                        efficiencyCount: { $sum: { $cond: [{ $ne: ["$fuelEfficiency", null] }, 1, 0] } }
                    }
                }
            ]),
            Maintenance.aggregate([
                { $match: { vehicleId: vehicle._id, status: expenseRecordStatus.APPROVED } },
                { $group: { _id: null, totalMaintenanceCost: { $sum: "$cost" } } }
            ]),
            Task.aggregate([
                { $match: { vehicleId: vehicle._id, status: taskStatus.FINISHED } },
                {
                    $group: {
                        _id: null, distance: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $ne: ["$startOdometer", null] }, { $ne: ["$endOdometer", null] }] },
                                    { $subtract: ["$endOdometer", "$startOdometer"] }, 0
                                ]
                            }
                        }
                    }
                }
            ])
        ])
        const fuelStats = fuel[0] || {}
        success(res, 200, {
            stats: {
                distance: tasks[0]?.distance || 0,
                totalFuel: fuelStats.totalFuel || 0,
                totalFuelCost: fuelStats.totalFuelCost || 0,
                totalMaintenanceCost: maintenance[0]?.totalMaintenanceCost || 0,
                fuelEfficiency: fuelStats.efficiencyCount ? fuelStats.efficiencySum / fuelStats.efficiencyCount : 0
            }
        })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.setVehicleToTeam = async (req, res) => {
    const { companyId } = req.user
    const team = req.team
    const vehicleId = req.params.id
    if (!vehicleId) return error(res, 400, "Vehicle Id is required")
    if (!team) return error(res, 400, "Team is required")
    try {
        const vehicle = await Vehicle.findOne({ _id: vehicleId, companyId, isDeleted: false, status: mainStatus.ACTIVE })
        if (!vehicle) return error(res, 404, "Vehicle not found")

        // If vehicle changes team, clear assigned driver if driver was from old team
        if (vehicle.teamId && vehicle.teamId.toString() !== team._id.toString()) {
            vehicle.driverId = null
        }

        vehicle.teamId = team._id
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
        if (existingVehicle.isInTask || existingVehicle.status === vehicleStatus.INMAINTENANCE) {
            return error(res, 400, "Cannot delete vehicle while it is in an active task or maintenance")
        }
        const activeMaintenance = await Maintenance.exists({
            vehicleId: existingVehicle._id,
            status: { $in: [expenseRecordStatus.PENDING, expenseRecordStatus.APPROVED] }
        })
        if (activeMaintenance) return error(res, 400, "Cannot delete vehicle with active maintenance")

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