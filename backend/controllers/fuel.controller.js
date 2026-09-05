const Fuel = require("../models/fuel.model")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const { userRoles } = require("../data/roles")
const { mainStatus, taskStatus, expenseRecordStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")

exports.createFuelRecord = async (req, res) => {
    const user = req.user
    const { vehicleId, cost, qty, odometer, isFullTank, images = [] } = req.body
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

        const numericOdometer = Number(odometer)
        const lastOdometer = vehicle.currentOdometer ?? vehicle.initialOdometer
        if (numericOdometer < lastOdometer) {
            return error(res, 400, "Odometer cannot be lower than the vehicle's last reading")
        }

        const lastFullFuel = await Fuel.findOne({
            vehicleId: vehicle._id,
            isFullTank: true,
            odometer: { $lte: numericOdometer }
        }).sort({ odometer: -1, createdAt: -1 })

        const record = await Fuel.create({
            vehicleId: vehicle._id,
            cost,
            qty,
            odometer: numericOdometer,
            isFullTank: Boolean(isFullTank),
            images,
            companyId: user.companyId,
            teamId: vehicle.teamId || null,
            driverId: user._id
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
            .populate("driverId", "name email")
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

        const fuelRecord = await Fuel.findOneAndUpdate(filters, {
            status
        }, { new: true, runValidators: true })

        if (!fuelRecord) return error(res, 404, "Fuel Record Not Found")

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
