const mongoose = require("mongoose");
const { userStatus } = require("../data/status");
const { userRoles } = require("../data/roles");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        enum: [userRoles.SUPER_ADMIN, userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER],
        default: [userRoles.ADMIN]
    },
    status: {
        type: String,
        enum: [userStatus.ACTIVE, userStatus.INACTIVE],
        default: userStatus.ACTIVE
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company",
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;