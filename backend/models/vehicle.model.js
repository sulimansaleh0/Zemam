const mongoose = require("mongoose")
const { vehicleStatus, gpsStatus } = require("../data/status")
const { vehicleTypes } = require("../data/vehicleTypes")
const { fuelTypes } = require("../data")

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
        type: String,
        trim: true,
        required: true
    },
    vehicleType: {
        type: String,
        enum: Object.values(vehicleTypes),
        required: true
    },
    currentOdometer: {
        type: Number,
        min: 0,
        default: 0
    },
    expectedFuelEfficiency: {
        type: Number,
        required: true,
        min: 0.1
    },
    fuelBalanceLitres: {
        type: Number,
        default: 0
    },
    tankCapacity: {
        type: Number,
        required: true,
        min: 0
    },
    fuelType: {
        type: String,
        enum: fuelTypes,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    issuingAuthority: String,
    insuranceNumber: String,
    insuranceCompany: String,
    insuranceExpiry: Date,
    licenseExpiry: {
        type: Date,
        required: true
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
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        speed: { type: Number, default: 0 },
        heading: { type: Number, default: 0 },
        updatedAt: { type: Date, default: Date.now }
    },
    gpsStatus: {
        type: String,
        enum: Object.values(gpsStatus),
        default: gpsStatus.AVAILABLE
    },
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