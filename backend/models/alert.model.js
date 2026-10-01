const mongoose = require("mongoose")

const alertSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["fuel_issue", "frequent_maintenance", "license_expiry", "insurance_expiry", "driver_score_drop", "gps_alert"],
        required: true
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium"
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicle"
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

alertSchema.index({ companyId: 1, teamId: 1, createdAt: -1 })

module.exports = mongoose.model("alert", alertSchema)
