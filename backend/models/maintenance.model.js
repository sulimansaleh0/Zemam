const mongoose = require("mongoose")
const { expenseRecordStatus } = require("../data/status")

const maintenanceSchema = new mongoose.Schema({
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
    }
}, { timestamps: true })

const Maintenance = mongoose.model("maintenance", maintenanceSchema)
module.exports = Maintenance