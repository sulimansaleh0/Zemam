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
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
})

const Vehicle = mongoose.model("vehicle", vehicleSchema)
module.exports = Vehicle