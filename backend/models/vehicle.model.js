const mongoose = require("mongoose")
const { mainStatus } = require("../data/status")

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
    isInTask: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: [mainStatus.ACTIVE, mainStatus.INACTIVE],
        default: mainStatus.ACTIVE
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
    }
})

const Vehicle = mongoose.model("vehicle", vehicleSchema)
module.exports = Vehicle