const mongoose = require("mongoose")
const { expenseRecordStatus } = require("../data/status")

const fuelSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicle",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    image: {
        type: String,
        default: null
    },
    cost: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        min: 0
    },
    odometer: {
        type: Number,
        required: true,
        min: 0
    },
    isFullTank: {
        type: Boolean,
        required: true,
        default: false
    },
    distanceSinceLastFull: {
        type: Number,
        default: null,
        min: 0
    },
    fuelSinceLastFull: {
        type: Number,
        default: null,
        min: 0
    },
    fuelEfficiency: {
        type: Number,
        default: null,
        min: 0
    },
    fuelIssue: {
        type: Boolean,
        default: false
    },
    fuelIssueType: {
        type: String,
        enum: ["high_consumption", "possible_leak", null],
        default: null
    },
    fuelIssueMessage: {
        type: String,
        default: null
    },
    nextOdoMeter: {
        type: Number,
        default: null
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true })

fuelSchema.index({ vehicleId: 1, createdAt: -1 })

const Fuel = mongoose.model("fuel", fuelSchema)
module.exports = Fuel