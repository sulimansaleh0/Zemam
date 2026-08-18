const mongoose = require("mongoose");
const { mainStatus } = require("../data/status");
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
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    roles: {
        type: [String],
        enum: [userRoles.SUPER_ADMIN, userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER],
        default: [userRoles.ADMIN]
    },
    status: {
        type: String,
        enum: [mainStatus.ACTIVE, mainStatus.INACTIVE],
        default: mainStatus.ACTIVE
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


userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.provider;
    delete user.__v;
    return user;
};
const User = mongoose.model("User", userSchema);
module.exports = User;