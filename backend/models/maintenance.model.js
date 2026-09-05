const mongoose = require("mongoose")
const { expenseRecordStatus } = require("../data/status")

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
        required: true
    },
    status: {
        type: String,
        enum: [expenseRecordStatus.PENDING, expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED],
        default: expenseRecordStatus.PENDING
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
    declineReason: String,
    isDriverFault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Maintenance = mongoose.model("maintenance", maintenanceSchema)
module.exports = Maintenance