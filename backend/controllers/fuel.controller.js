const Fuel = require("../models/fuel.model")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const { calculateFuelMetrics, getFuelIssue } = require("../utils/fuelCalculations")

exports.createFuelRecord = async (req, res) => {
    const user = req.user
    const { vehicleId, cost, qty, odometer, isFullTank } = req.body
    const numericOdometer = Number(odometer)
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
                status: taskStatus.INPROGRESS
            })
            if (!activeTask) {
                return error(res, 403, "You can only report fuel for the vehicle in your active task")
            }
            vehicleFilters.teamId = activeTask.teamId
        }

        const vehicle = await Vehicle.findOne(vehicleFilters)
        if (!vehicle) return error(res, 404, "Vehicle Not Found")

        if (numericOdometer < vehicle.currentOdometer) {
            return error(res, 400, "Odometer cannot be lower than the vehicle's last reading")
        }

        const record = await Fuel.create({
            vehicleId: vehicle._id,
            cost,
            qty,
            odometer: numericOdometer,
            image,
            isFullTank,
            companyId: user.companyId,
            teamId: vehicle.teamId || null,
            userId: user._id
        })

        await Vehicle.updateOne(
            { _id: vehicle._id, currentOdometer: { $lte: numericOdometer } },
            { $set: { currentOdometer: numericOdometer } }
        )

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
                    fuelIssues: { $sum: { $cond: ["$fuelIssue", 1, 0] } },
                    fullTankRecords: { $sum: { $cond: ["$isFullTank", 1, 0] } },
                    efficiencySum: { $sum: { $cond: [{ $ne: ["$fuelEfficiency", null] }, "$fuelEfficiency", 0] } },
                    efficiencyCount: { $sum: { $cond: [{ $ne: ["$fuelEfficiency", null] }, 1, 0] } }
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
                            { $gt: ["$efficiencyCount", 0] },
                            { $divide: ["$efficiencySum", "$efficiencyCount"] },
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
            .populate("vehicleId", "expectedFuelEfficiency")

        if (!fuelRecord) return error(res, 404, "Fuel Record Not Found")

        const vehicleId = fuelRecord.vehicleId._id
        const update = { status }
        if (status === expenseRecordStatus.APPROVED && fuelRecord.isFullTank) {
            const previousFullTank = await Fuel.findOne({
                vehicleId,
                companyId: user.companyId,
                isFullTank: true,
                status: expenseRecordStatus.APPROVED,
                odometer: { $lt: fuelRecord.odometer }
            }).sort({ odometer: -1, createdAt: -1 })

            if (previousFullTank) {
                const fuelSinceLastFull = await Fuel.aggregate([
                    {
                        $match: {
                            vehicleId,
                            companyId: user.companyId,
                            odometer: { $gt: previousFullTank.odometer, $lte: fuelRecord.odometer },
                            $or: [
                                { status: expenseRecordStatus.APPROVED },
                                { _id: fuelRecord._id }
                            ]
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$qty" } } }
                ])
                const totalFuel = fuelSinceLastFull[0]?.total || fuelRecord.qty
                const metrics = calculateFuelMetrics({
                    totalFuel,
                    currentOdometer: fuelRecord.odometer,
                    previousOdometer: previousFullTank.odometer
                })

                if (metrics) {
                    Object.assign(update, metrics, getFuelIssue({
                        fuelEfficiency: metrics.fuelEfficiency,
                        expectedFuelEfficiency: fuelRecord.vehicleId.expectedFuelEfficiency
                    }))
                }
            }
        }

        const result = await Fuel.updateOne(
            { ...filters, status: expenseRecordStatus.PENDING },
            update,
            { runValidators: true }
        )

        if (!result.modifiedCount) return error(res, 409, "Fuel Record was already verified")

        const updatedRecord = await Fuel.findById(recordId)
            .populate("vehicleId", "model plateNumber expectedFuelEfficiency")
            .populate("userId", "name email")

        success(res, 200, { record: updatedRecord })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
