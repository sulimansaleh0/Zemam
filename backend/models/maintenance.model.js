const mongoose = require("mongoose")
const { expenseRecordStatus } = require("../data/status")
const { maintenanceCategories, maintenancePriority } = require("../data")

const maintenanceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicle",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String]
    },
    cost: {
        type: Number,
    },
    category: {
        type: String,
        enum: Object.values(maintenanceCategories),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(expenseRecordStatus),
        default: expenseRecordStatus.PENDING
    },
    priority: {
        type: String,
        enum: Object.values(maintenancePriority),
        default: maintenancePriority.LOW
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    odoMeter: {
        type: Number,
        required: true
    },
    declineReason: String,
    isDriverFault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Maintenance = mongoose.model("maintenance", maintenanceSchema)
module.exports = Maintenance