const mongoose = require("mongoose")

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        index: { expires: 0 }
    }
}, { timestamps: true })

const RefreshToken = mongoose.model("refreshToken", refreshTokenSchema)
module.exports = RefreshToken