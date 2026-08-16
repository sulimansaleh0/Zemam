const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    sentTo: {
        type: String,
        required: true
    },
    hashedOtp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        expires: 0,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Otp = mongoose.model("otp", otpSchema)
module.exports = Otp