const Fuel = require("../models/fuel.model")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const { calculateApprovedFuelMetrics } = require("../utils/fuelCalculations")

const recalculateApprovedFuelRecords = async (vehicleId, companyId, expectedFuelEfficiency) => {
    const approvedRecords = await Fuel.find({
        vehicleId,
        companyId,
        status: expenseRecordStatus.APPROVED
    })
        .select("_id odometer qty isFullTank status createdAt")
        .sort({ createdAt: 1, _id: 1 })

    const metrics = calculateApprovedFuelMetrics(approvedRecords, expectedFuelEfficiency)
    if (metrics.length) {
        await Fuel.bulkWrite(metrics.map(({ _id, ...fields }) => ({
            updateOne: {
                filter: { _id, status: expenseRecordStatus.APPROVED },
                update: { $set: fields }
            }
        })))
    }
}

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
    const { status, vehicleId, fuelIssue } = req.query
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
        if (fuelIssue !== undefined)
            filters.fuelIssue = fuelIssue === "true"

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
        if (req.query.vehicleId)
            match.vehicleId = req.query.vehicleId

        const [summary] = await Fuel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    totalCost: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$cost", 0] } },
                    totalQty: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$qty", 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.PENDING] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, 1, 0] } },
                    declined: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.DECLINED] }, 1, 0] } },
                    fuelIssues: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$fuelIssue"] },
                                1,
                                0
                            ]
                        }
                    },
                    fullTankRecords: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$isFullTank"] },
                                1,
                                0
                            ]
                        }
                    },
                    efficiencyDistance: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, { $ne: ["$fuelEfficiency", null] }] },
                                "$distanceSinceLastFull",
                                0
                            ]
                        }
                    },
                    efficiencyFuel: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, { $ne: ["$fuelEfficiency", null] }] },
                                "$fuelSinceLastFull",
                                0
                            ]
                        }
                    }
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
                    declined: 1,
                    fuelIssues: 1,
                    fullTankRecords: 1,
                    averageEfficiency: {
                        $cond: [
                            { $gt: ["$efficiencyFuel", 0] },
                            { $divide: ["$efficiencyDistance", "$efficiencyFuel"] },
                            0
                        ]
                    }
                }
            }
        ])

        success(res, 200, {
            stats: summary || {
                totalRecords: 0,
                totalCost: 0,
                totalQty: 0,
                pending: 0,
                approved: 0,
                declined: 0,
                fuelIssues: 0,
                fullTankRecords: 0,
                averageEfficiency: 0
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
        }).select("expectedFuelEfficiency tankCapacity currentOdometer")
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
            if (!Number.isFinite(vehicle.expectedFuelEfficiency) || vehicle.expectedFuelEfficiency <= 0) {
                return error(res, 409, "Vehicle expected fuel efficiency is not configured")
            }
        }

        const verifiedAt = new Date()
        const result = await Fuel.updateOne(
            { ...filters, status: expenseRecordStatus.PENDING },
            {
                $set: {
                    status,
                    verifiedBy: user._id,
                    verifiedAt,
                    ...(status === expenseRecordStatus.DECLINED ? {
                        distanceSinceLastFull: null,
                        fuelSinceLastFull: null,
                        fuelEfficiency: null,
                        fuelIssue: false,
                        fuelIssueType: null,
                        fuelIssueMessage: null
                    } : {})
                }
            },
            { runValidators: true }
        )

        if (!result.modifiedCount) return error(res, 409, "Fuel Record was already verified")

        if (status === expenseRecordStatus.APPROVED) {
            await recalculateApprovedFuelRecords(
                vehicleId,
                user.companyId,
                vehicle.expectedFuelEfficiency
            )
        }

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
