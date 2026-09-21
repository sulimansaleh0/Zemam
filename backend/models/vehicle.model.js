const mongoose = require("mongoose")
const { vehicleStatus } = require("../data/status")
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
        default: vehicleTypes.NORMAL
    },
    currentOdometer: {
        type: Number,
        required: true,
        min: 0
    },
    expectedFuelEfficiency: {
        type: Number,
        required: true,
        min: 0.1
    },
    tankCapacity: {
        type: Number,
        required: true,
        min: 0,
        default: 50
    },
    fuelType: {
        type: String,
        enum: fuelTypes,
        default: fuelTypes[0]
    },
    licenseNumber: String,
    issuingAuthority: String,
    insuranceNumber: String,
    insuranceCompany: String,
    insuranceType: {
        type: String,
        enum: ["comprehensive", "third_party"]
    },
    insuranceExpiry: Date,
    licenseExpiry: Date,
    isInTask: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: [vehicleStatus.ACTIVE, vehicleStatus.INACTIVE, vehicleStatus.INMAINTENANCE],
        default: vehicleStatus.ACTIVE
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