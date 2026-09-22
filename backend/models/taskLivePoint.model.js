const mongoose = require("mongoose");

const taskLivePointSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
        required: true,
        index: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicle",
        required: true,
        index: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    speed: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours TTL auto-deletion
    }
});

taskLivePointSchema.index({ taskId: 1, timestamp: 1 });

const TaskLivePoint = mongoose.model("taskLivePoint", taskLivePointSchema);
module.exports = TaskLivePoint;
