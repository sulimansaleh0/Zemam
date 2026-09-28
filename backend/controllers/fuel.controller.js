const Fuel = require("../models/fuel.model")
const mongoose = require("mongoose")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")

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
            isFullTank: isFullTank ?? false,
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
        const match = { companyId: user.companyId }
        if (user.role === userRoles.FLEET_MANAGER)
            match.teamId = user.teamId
        else if (req.teamId)
            match.teamId = req.teamId
        if (typeof req.query.vehicleId === "string")
            match.vehicleId = mongoose.isValidObjectId(req.query.vehicleId)
                ? new mongoose.Types.ObjectId(req.query.vehicleId)
                : req.query.vehicleId

        const taskMatch = {
            companyId: user.companyId,
            status: taskStatus.FINISHED
        }
        if (match.teamId) taskMatch.teamId = match.teamId
        if (match.vehicleId) taskMatch.vehicleId = match.vehicleId

        const vehicleMatch = { companyId: user.companyId, isDeleted: false }
        if (match.teamId) vehicleMatch.teamId = match.teamId
        if (match.vehicleId) vehicleMatch._id = match.vehicleId

        const [summary, [taskSummary], [balanceSummary]] = await Promise.all([
            Fuel.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: null,
                        totalRecords: { $sum: 1 },
                        totalCost: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$cost", 0] } },
                        totalQty: { $sum: "$qty" },
                        pending: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.PENDING] }, 1, 0] } },
                        approved: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, 1, 0] } },
                        declined: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.DECLINED] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRecords: 1,
                        totalCost: 1,
                        totalQty: 1,
                        pending: 1,
                        approved: 1,
                        declined: 1
                    }
                }
            ]),
            Task.aggregate([
                { $match: taskMatch },
                {
                    $group: {
                        _id: null,
                        distance: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ["$fuelConsumptionAppliedAt", null] },
                                            { $ne: ["$startOdometer", null] },
                                            { $ne: ["$endOdometer", null] },
                                            { $gte: ["$endOdometer", "$startOdometer"] }
                                        ]
                                    },
                                    { $subtract: ["$endOdometer", "$startOdometer"] },
                                    0
                                ]
                            }
                        },
                        fuelConsumed: {
                            $sum: {
                                $cond: [
                                    { $ne: ["$fuelConsumptionAppliedAt", null] },
                                    { $ifNull: ["$fuelConsumedLitres", 0] },
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            Vehicle.aggregate([
                { $match: vehicleMatch },
                {
                    $group: {
                        _id: null,
                        fuelBalanceLitres: { $sum: { $ifNull: ["$fuelBalanceLitres", 0] } }
                    }
                }
            ])
        ])

        success(res, 200, {
            stats: {
                ...(summary || {
                    totalRecords: 0,
                    totalCost: 0,
                    totalQty: 0,
                    pending: 0,
                    approved: 0,
                    declined: 0
                }),
                fuelBalanceLitres: balanceSummary?.fuelBalanceLitres || 0,
                averageEfficiency: taskSummary?.fuelConsumed
                    ? taskSummary.distance / taskSummary.fuelConsumed
                    : 0
            }
        })
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
        }).select("tankCapacity currentOdometer")
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

        const session = await mongoose.startSession()
        let recordWasUpdated = false
        try {
            await session.withTransaction(async () => {
                recordWasUpdated = false
                const result = await Fuel.updateOne(
                    { ...filters, status: expenseRecordStatus.PENDING },
                    {
                        $set: {
                            status,
                            verifiedBy: user._id,
                            verifiedAt: new Date(),
                        }
                    },
                    { runValidators: true, session }
                )

                if (!result.modifiedCount) return
                recordWasUpdated = true

                if (status === expenseRecordStatus.APPROVED) {
                    const balanceUpdate = await Vehicle.updateOne(
                        { _id: vehicleId, companyId: user.companyId, isDeleted: false },
                        { $inc: { fuelBalanceLitres: fuelRecord.qty } },
                        { session }
                    )
                    if (!balanceUpdate.matchedCount) {
                        throw new Error("Vehicle not found while adding approved fuel balance")
                    }
                }
            })
        } finally {
            await session.endSession()
        }

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
