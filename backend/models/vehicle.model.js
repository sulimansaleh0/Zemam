const mongoose = require("mongoose")

const vehicleSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    plateNumber: {
        type: Number,
        required: true
    },
    initialOdometer: {
        type: Number,
        required: true,
        min: 0
    },
    currentOdometer: {
        type: Number,
        min: 0
    },
    isInTask: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: [vehicleStatus.ACTIVE, vehicleStatus.INACTIVE, vehicleStatus.INMAINTENANCE],
        default: vehicleStatus.ACTIVE
    },
    periodicInspectionExpiry: Date,
    insuranceExpiry: Date,
    licenseExpiry: Date,
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
})

const Vehicle = mongoose.model("vehicle", vehicleSchema)
module.exports = Vehicle