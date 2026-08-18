const mongoose = require("mongoose")
const { expenseRecordStatus } = require("../data/status")

const fuelSchema = new mongoose.Schema({
    image: {
        type: String
    },
    cost: {
        type: Number,
        required: true
    },
    qty: {
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
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true })

const Fuel = mongoose.model("fuel", fuelSchema)
module.exports = Fuel