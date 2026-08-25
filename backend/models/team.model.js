const mongoose = require("mongoose")

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
    isDeleted: {
        type: Boolean,
        default: false
    }
})

const Team = mongoose.model("team", teamSchema)
module.exports = Team