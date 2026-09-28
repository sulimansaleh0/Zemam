const Fuel = require("../models/fuel.model")
const mongoose = require("mongoose")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const {
    getFuelStats: getFuelStatsData,
    applyFuelVerification
} = require("../services/fuel")

exports.createFuelRecord = async (req, res) => {
    const user = req.user
    const { vehicleId, cost, qty, isFullTank, location } = req.body
    const image = req.body.image || req.body.images?.[0]
    if (!image) return error(res, 400, "A fuel receipt image is required")
    try {
        const vehicleFilters = {
            _id: vehicleId,
            companyId: user.companyId,
            status: mainStatus.ACTIVE,
            isDeleted: false
        }

        if (user.role === userRoles.FLEET_MANAGER) {
            vehicleFilters.teamId = user.teamId
        } else if (user.role === userRoles.DRIVER) {
            const activeTask = await Task.findOne({
                driverId: user._id,
                vehicleId,
                companyId: user.companyId,
                status: { $in: [taskStatus.INPROGRESS, taskStatus.PENDING] }
            })
            const isAssigned = await Vehicle.findOne({
                _id: vehicleId,
                driverId: user._id,
                companyId: user.companyId
            })
            if (!activeTask && !isAssigned) {
                return error(res, 403, "You can only report fuel for an assigned vehicle or active task")
            }
            if (activeTask) {
                vehicleFilters.teamId = activeTask.teamId
            }
        }

        const vehicle = await Vehicle.findOne(vehicleFilters)
        if (!vehicle) return error(res, 404, "Vehicle Not Found")
        if (Number(qty) > vehicle.tankCapacity) {
            return error(res, 400, "Fuel quantity cannot exceed the vehicle tank capacity")
        }

        const record = await Fuel.create({
            vehicleId: vehicle._id,
            cost,
            qty,
            odometer: vehicle.currentOdometer,
            image,
            isFullTank,
            companyId: user.companyId,
            teamId: vehicle.teamId || null,
            userId: user._id,
            location
        })

        success(res, 201, { record })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listFuelRecords = async (req, res) => {
    const user = req.user
    const { status, vehicleId } = req.query
    try {
        let filters = { companyId: user.companyId }
        if (user.role === userRoles.FLEET_MANAGER)
            filters.teamId = user.teamId
        else if (req.teamId)
            filters.teamId = req.teamId
        if (status)
            filters.status = status
        if (vehicleId)
            filters.vehicleId = vehicleId
        const records = await Fuel.find(filters)
            .populate("vehicleId", "model plateNumber")
            .populate("userId", "name email")
            .populate("verifiedBy", "name email")
            .sort({ createdAt: -1 })
        success(res, 200, { records })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.getFuelStats = async (req, res) => {
    const user = req.user
    try {
        const teamId = user.role === userRoles.FLEET_MANAGER ? user.teamId : req.teamId
        const vehicleId = typeof req.query.vehicleId === "string"
            ? mongoose.isValidObjectId(req.query.vehicleId)
                ? new mongoose.Types.ObjectId(req.query.vehicleId)
                : req.query.vehicleId
            : null
        const stats = await getFuelStatsData({
            companyId: user.companyId,
            teamId,
            vehicleId
        })

        success(res, 200, { stats })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyFuelRecord = async (req, res) => {
    const user = req.user
    const { status } = req.body
    const recordId = req.params.id || null
    if (!recordId) return error(res, 400, "Record Id is required")
    try {
        const filters = {
            _id: recordId,
            companyId: user.companyId
        }
        if (user.role === userRoles.FLEET_MANAGER)
            filters.teamId = user.teamId

        const fuelRecord = await Fuel.findOne({ ...filters, status: expenseRecordStatus.PENDING })

        if (!fuelRecord || !fuelRecord.vehicleId) return error(res, 404, "Fuel Record or vehicle not found")

        const vehicleId = fuelRecord.vehicleId
        const vehicle = await Vehicle.findOne({
            _id: vehicleId,
            companyId: user.companyId
        }).select("tankCapacity currentOdometer expectedFuelEfficiency")
        if (!vehicle) return error(res, 404, "Fuel Record vehicle not found")

        if (status === expenseRecordStatus.APPROVED) {
            if (!fuelRecord.image) {
                return error(res, 400, "A fuel receipt image is required")
            }
            if (!Number.isFinite(fuelRecord.cost) || fuelRecord.cost < 0) {
                return error(res, 400, "Fuel cost must be a non-negative number")
            }
            if (!Number.isFinite(fuelRecord.qty) || fuelRecord.qty <= 0) {
                return error(res, 400, "Fuel quantity must be greater than zero")
            }
            if (fuelRecord.qty > vehicle.tankCapacity) {
                return error(res, 400, "Fuel quantity cannot exceed the vehicle tank capacity")
            }
            if (
                !Number.isFinite(fuelRecord.odometer) ||
                fuelRecord.odometer < 0 ||
                fuelRecord.odometer > vehicle.currentOdometer
            ) {
                return error(res, 409, "Fuel record odometer is not valid for the vehicle")
            }
        }

        const recordWasUpdated = await applyFuelVerification({
            filters,
            fuelRecord,
            vehicle,
            status,
            user
        })
        if (!recordWasUpdated) return error(res, 409, "Fuel Record was already verified")

        const updatedRecord = await Fuel.findById(recordId)
            .populate("vehicleId", "model plateNumber expectedFuelEfficiency")
            .populate("userId", "name email")
            .populate("verifiedBy", "name email")

        success(res, 200, { record: updatedRecord })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
