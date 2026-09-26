const Maintenance = require("../models/maintenance.model")
const Vehicle = require("../models/vehicle.model")
const Task = require("../models/task.model")
const User = require("../models/user.model")
const { expenseRecordStatus, taskStatus, mainStatus } = require("../data/status")
const { success, error, serverError } = require("../utils/responses")
const { userRoles } = require("../data/roles")
const { vehicleStatus } = require("../data/status")
const { maintenancePriority } = require("../data")

exports.createMaintenanceRecord = async (req, res) => {
    const user = req.user
    const { vehicleId, description, cost, images, category, odometer, priority } = req.body
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
                status: { $in: [taskStatus.INPROGRESS, taskStatus.PENDING] }
            })
            const isAssigned = await Vehicle.findOne({
                _id: vehicleId,
                driverId: user._id,
                companyId: user.companyId
            })
            if (!task && !isAssigned)
                return error(res, 403, "You can only report an issue for an assigned vehicle or active task")

            if (task) {
                vehicleFilters.teamId = task.teamId
            }
        }

        const vehicle = await Vehicle.findOne(vehicleFilters)
        if (!vehicle) return error(res, 404, "Vehicle Not Found")

        const numericOdometer = odometer !== undefined && odometer !== null && odometer !== ""
            ? Number(odometer)
            : vehicle.currentOdometer

        if (numericOdometer < vehicle.currentOdometer) {
            return error(res, 400, "Odometer cannot be lower than the vehicle's last reading")
        }

        const record = await Maintenance.create({
            vehicleId,
            description,
            cost: cost != null && cost !== "" ? Number(cost) : 0,
            images,
            category,
            odoMeter: numericOdometer,
            companyId: user.companyId,
            teamId: vehicle.teamId || null,
            reportedBy: user._id,
            driverId: user.role === userRoles.DRIVER ? user._id : vehicle.driverId,
            priority
        })

        await Vehicle.updateOne(
            { _id: vehicle._id, currentOdometer: { $lte: numericOdometer } },
            { $set: { currentOdometer: numericOdometer } }
        )

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
            .populate("reportedBy", "name email")
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
            companyId: user.companyId,
            status: expenseRecordStatus.PENDING
        }

        if (user.role === userRoles.FLEET_MANAGER) {
            filters.$or = [
                { teamId: user.teamId },
                { teamId: null },
                { teamId: { $exists: false } }
            ]
        }

        const pendingRecord = await Maintenance.findOne(filters)
        if (!pendingRecord) {
            const alreadyProcessed = await Maintenance.findOne({ _id: recordId, companyId: user.companyId })
            if (alreadyProcessed) {
                if (alreadyProcessed.status !== expenseRecordStatus.PENDING) {
                    return error(res, 400, "تم اعتماد أو معالجة هذا الطلب مسبقاً")
                }
                if (user.role === userRoles.FLEET_MANAGER && alreadyProcessed.teamId && alreadyProcessed.teamId.toString() !== user.teamId.toString()) {
                    return error(res, 403, "ليس لديك صلاحية لاعتماد طلب صيانة تابع لفريق آخر")
                }
            }
            return error(res, 404, "سجل الصيانة غير موجود أو تمت معالجته")
        }

        let targetDriverId = pendingRecord.driverId
        if (status === expenseRecordStatus.APPROVED && Boolean(isDriverFault)) {
            if (!targetDriverId) {
                const vehicle = await Vehicle.findById(pendingRecord.vehicleId)
                if (vehicle?.driverId) {
                    targetDriverId = vehicle.driverId
                }
            }
            if (!targetDriverId) {
                return error(res, 400, "لا يمكن تحميل المسؤولية لسائق نظراً لعدم وجود سائق مرتبط بهذه المركبة أو الطلب")
            }
        }

        const updateData = {
            status,
            declineReason: status === expenseRecordStatus.DECLINED ? (declineReason || "تم الرفض بواسطة الإدارة") : undefined,
            isDriverFault: status === expenseRecordStatus.APPROVED ? Boolean(isDriverFault) : false
        }

        if (cost !== undefined && cost !== null && cost !== "") {
            updateData.cost = Number(cost)
        }
        if (targetDriverId) {
            updateData.driverId = targetDriverId
        }

        const maintenanceRecord = await Maintenance.findByIdAndUpdate(
            pendingRecord._id,
            { $set: updateData },
            { new: true }
        )

        if (!maintenanceRecord) return error(res, 400, "فشل تحديث سجل الصيانة")

        const activeMaintenance = await Maintenance.exists({
            vehicleId: maintenanceRecord.vehicleId,
            status: expenseRecordStatus.PENDING,
            _id: { $ne: maintenanceRecord._id }
        })
        if (!activeMaintenance) {
            await Vehicle.findByIdAndUpdate(maintenanceRecord.vehicleId, { status: vehicleStatus.ACTIVE })
        }

        if (maintenanceRecord.status === expenseRecordStatus.APPROVED && maintenanceRecord.isDriverFault && !maintenanceRecord.driverFaultProcessed && maintenanceRecord.driverId) {
            const points = maintenanceRecord.priority === maintenancePriority.HIGH ? -15 : -8
            try {
                const driver = await User.findById(maintenanceRecord.driverId)
                if (driver) {
                    driver.faultIncidentsCount = (driver.faultIncidentsCount || 0) + 1
                    if (!driver.scoreHistory) driver.scoreHistory = []
                    driver.scoreHistory.push({
                        pointsChange: points,
                        reason: "Approved maintenance fault attributed to driver",
                        category: "maintenance",
                        relatedId: maintenanceRecord._id,
                        createdAt: new Date()
                    })
                    driver.driverScore = Math.max(0, (driver.driverScore ?? 100) + points)
                    await driver.save()
                }
                await Maintenance.findByIdAndUpdate(maintenanceRecord._id, { driverFaultProcessed: true })
            } catch (driverUpdateErr) {
                console.error("⚠️ [Driver Score Update Warning]:", driverUpdateErr.message)
            }
        }

        return success(res, 200, { record: maintenanceRecord })
    } catch (err) {
        console.log(err)
        return serverError(res)
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