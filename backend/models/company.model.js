const mongoose = require("mongoose")
const { mainStatus } = require("../data/status")
const { plans, subscriptionStatus } = require("../data/plans")

const TRIAL_DURATION_DAYS = 7

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [mainStatus.ACTIVE, mainStatus.INACTIVE],
        default: mainStatus.ACTIVE
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },

    // Subscription
    plan: {
        type: String,
        enum: [plans.FREE, plans.TRIAL, plans.MONTHLY, plans.ANNUAL],
        default: plans.TRIAL
    },

    subscriptionStatus: {
        type: String,
        enum: [subscriptionStatus.ACTIVE, subscriptionStatus.EXPIRED],
        default: subscriptionStatus.ACTIVE
    },

    subscriptionStartedAt: {
        type: Date,
        default: Date.now
    },
    subscriptionEndsAt: {
        type: Date,
        default: () =>
            new Date(
                Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000
            )
    }
}, { timestamps: true })

const Company = mongoose.model("company", companySchema)
module.exports = Company