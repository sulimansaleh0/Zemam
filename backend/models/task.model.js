const mongoose = require("mongoose")
const { taskStatus } = require("../data/status")

const taskSchema = new mongoose.Schema({
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
        type: String,
    },
    endedAt: {
        type: Date
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
    }
})

const Task = mongoose.model("task", taskSchema)
module.exports = Task