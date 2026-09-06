const Maintenance = require("../models/maintenance.model")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const { expenseRecordStatus, taskStatus, mainStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")
const { vehicleStatus } = require("../data/status")

exports.createMaintenanceRecord = async (req, res) => {
    const user = req.user
    const { vehicleId, description, cost, images, priority } = req.body
    try {
        const vehicleFilters = {
            _id: vehicleId,
            companyId: user.companyId,
            status: mainStatus.ACTIVE,
            isDeleted: false
        }

        if (user.role === userRoles.FLEET_MANAGER)
            vehicleFilters.teamId = user.teamId

        if (user.role === userRoles.DRIVER) {
            const task = await Task.findOne({
                driverId: user._id,
                vehicleId,
                companyId: user.companyId,
                status: taskStatus.PENDING
            })
            if (!task)
                return error(res, 403, "You can only report an issue for the vehicle in your task")

            vehicleFilters.teamId = task.teamId
        }

        const vehicle = await Vehicle.findOne(vehicleFilters)
        if (!vehicle) return error(res, 404, "Vehicle Not Found")

        const record = await Maintenance.create({
            vehicleId,
            description,
            cost,
            images,
            companyId: user.companyId,
            teamId: vehicle.teamId || null,
            reportedBy: user._id,
            priority
        })

        if (priority === maintenancePriority.HIGH) {
            vehicle.status = vehicleStatus.INMAINTENANCE
            await vehicle.save()
        }
        success(res, 201, { record })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listMaintenanceRecords = async (req, res) => {
    const user = req.user
    const { status, category, vehicleId } = req.query
    try {
        let filters = { companyId: user.companyId }
        if (user.role === userRoles.FLEET_MANAGER)
            filters.teamId = user.teamId
        else if (req.teamId)
            filters.teamId = req.teamId
        if (status)
            filters.status = status
        if (category)
            filters.category = category
        if (vehicleId)
            filters.vehicleId = vehicleId

        const records = await Maintenance.find(filters)
            .populate("vehicleId", "model plateNumber")
            .populate("reportedBy", "firstName lastName email")
            .sort({ createdAt: -1 })
        success(res, 200, { records })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.verifyMaintenanceRecord = async (req, res) => {
    const user = req.user
    const { status, declineReason, isDriverFault, cost } = req.body
    const recordId = req.params.id
    try {
        const filters = {
            _id: recordId,
            companyId: user.companyId
        }
        if (user.role === userRoles.FLEET_MANAGER)
            filters.teamId = user.teamId

        const maintenanceRecord = await Maintenance.findOneAndUpdate(filters, {
            status,
            cost,
            declineReason: status === expenseRecordStatus.DECLINED ? declineReason : undefined,
            isDriverFault: status === expenseRecordStatus.APPROVED ? Boolean(isDriverFault) : undefined
        }, { new: true, runValidators: true })

        if (!maintenanceRecord) return error(res, 400, "Maintenance Record Not Found")
        await Vehicle.findByIdAndUpdate(maintenanceRecord.vehicleId, { status: vehicleStatus.ACTIVE })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.getMaintenanceStats = async (req, res) => {
    const user = req.user
    try {
        const match = { companyId: user.companyId }
        if (user.role === userRoles.FLEET_MANAGER)
            match.teamId = user.teamId
        else if (req.teamId)
            match.teamId = req.teamId
        const [summary] = await Maintenance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    totalCost: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, "$cost", 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.PENDING] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.APPROVED] }, 1, 0] } },
                    declined: { $sum: { $cond: [{ $eq: ["$status", expenseRecordStatus.DECLINED] }, 1, 0] } }
                }
            },
            { $project: { _id: 0 } }
        ])
        success(res, 200, { stats: summary || { totalRecords: 0, totalCost: 0, pending: 0, approved: 0, declined: 0 } })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}