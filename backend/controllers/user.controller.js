const User = require("../models/user.model")
const Team = require("../models/team.model")
const { sendRegisterEmail } = require("../services/email")
const { userRoles } = require("../data/roles")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const { success, error, serverError } = require("../utils/responses")

exports.me = async (req, res) => {
    const user = req.user
    if (!user) return error(res, 401, "UnAuthorized")
    try {
        const userData = await User.findById(user._id)
        if (!userData) return error(res, 400, "User Not Found")
        success(res, 200, { user: userData })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.updateProfile = async (req, res) => {
    const user = req.user
    if (!user) return error(res, 401, "UnAuthorized")
    const { name, email, password } = req.body;
    try {
        let newPassword = password
        if (newPassword) {
            newPassword = await bcrypt.hash(password, 9)
        }
        await User.findByIdAndUpdate(user._id, {
            name,
            email,
            password: newPassword
        })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.createFleetManager = async (req, res) => {
    const user = req.user
    const { email, teamId } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already in use")

        const team = await Team.findOne({ _id: teamId, companyId: user.companyId })
        if (!team) return error(res, 404, "team not found")

        const password = crypto.randomBytes(6).toString("base64url").slice(0, 8)
        const passwordHash = await bcrypt.hash(password, 9)
        await User.create({
            email,
            password: passwordHash,
            companyId: user.companyId,
            teamId,
            roles: [userRoles.FLEET_MANAGER]
        })
        await Team.findByIdAndUpdate(teamId, { managerId: user._id })
        success(res, 201)
        sendRegisterEmail({ email, password })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
