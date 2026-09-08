const mongoose = require("mongoose")
const { taskStatus } = require("../data/status")

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [taskStatus.PENDING, taskStatus.INPROGRESS, taskStatus.FINISHED, taskStatus.DECLINED],
        default: taskStatus.PENDING
    },
    startedAt: {
        type: Date
    },
    finishedAt: {
        type: Date
    },
    startTime: {
        type: Date,
        required: true
    },
    pickupLocation: {
        address: { type: String, required: true, trim: true },
        lat: { type: String, required: true, trim: true },
        lng: { type: String, required: true, trim: true }
    },
    deliveryLocation: {
        address: { type: String, required: true, trim: true },
        lat: { type: String, required: true, trim: true },
        lng: { type: String, required: true, trim: true }
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicle",
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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
    declineReason: String
})

const Task = mongoose.model("task", taskSchema)
module.exports = Task