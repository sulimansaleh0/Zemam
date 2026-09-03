const Task = require("../models/task.model")
const Vehicle = require("../models/vehicle.model")
const Maintenance = require("../models/maintenance.model")
const Fuel = require("../models/fuel.model")
const { taskStatus, mainStatus, expenseRecordStatus } = require("../data/status")

module.exports = async (roles) => {
    const [
        totalTasks,
        pendingTasks,
        inProgressTasks,
        finishedTasks,
        declinedTasks,
        totalVehicles,
        activeVehicles,
        availableVehicles,
        FuelRecordsCost,
        FuelRecords,
        approvedFuelRecords,
        declinedFuelRecords,
        pendingFuelRecords,
        maintenanceRecordsCost,
        maintenanceRecords,
        approvedMaintenanceRecords,
        declinedMaintenanceRecords,
        pendingMaintenanceRecords,
    ] = await Promise.all([
        Task.countDocuments({ ...roles }),
        Task.countDocuments({ ...roles, status: taskStatus.PENDING }),
        Task.countDocuments({ ...roles, status: taskStatus.INPROGRESS }),
        Task.countDocuments({ ...roles, status: taskStatus.FINISHED }),
        Task.countDocuments({ ...roles, status: taskStatus.DECLINED }),

        Vehicle.countDocuments({ ...roles }),
        Vehicle.countDocuments({ ...roles, status: mainStatus.ACTIVE }),
        Vehicle.countDocuments({ ...roles, isInTask: false }),

        Fuel.aggregate([
            {
                $match: {
                    ...roles,
                    status: expenseRecordStatus.APPROVED
                }
            },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: "$cost" }
                }
            }
        ]),
        Fuel.countDocuments({ ...roles }),
        Fuel.countDocuments({ ...roles, status: expenseRecordStatus.APPROVED }),
        Fuel.countDocuments({ ...roles, status: expenseRecordStatus.DECLINED }),
        Fuel.countDocuments({ ...roles, status: expenseRecordStatus.PENDING }),

        Maintenance.aggregate([
            {
                $match: {
                    ...roles,
                    status: expenseRecordStatus.APPROVED
                }
            },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: "$cost" }
                }
            }
        ]),
        Maintenance.countDocuments({ ...roles }),
        Maintenance.countDocuments({ ...roles, status: expenseRecordStatus.APPROVED }),
        Maintenance.countDocuments({ ...roles, status: expenseRecordStatus.DECLINED }),
        Maintenance.countDocuments({ ...roles, status: expenseRecordStatus.PENDING }),
    ])
    return {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        finishedTasks,
        declinedTasks,
        totalVehicles,
        activeVehicles,
        availableVehicles,
        FuelRecordsCost: FuelRecordsCost[0]?.totalCost,
        FuelRecords,
        approvedFuelRecords,
        declinedFuelRecords,
        pendingFuelRecords,
        maintenanceRecordsCost: maintenanceRecordsCost[0]?.totalCost,
        maintenanceRecords,
        approvedMaintenanceRecords,
        declinedMaintenanceRecords,
        pendingMaintenanceRecords,
    }
}