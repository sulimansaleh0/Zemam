const mongoose = require("mongoose")
const { mainStatus } = require("../data/status")

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    status: {
        type: String,
        enum: [mainStatus.ACTIVE, mainStatus.INACTIVE],
        default: mainStatus.ACTIVE
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})

const Team = mongoose.model("team", teamSchema)
module.exports = Team