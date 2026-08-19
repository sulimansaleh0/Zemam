const User = require("../models/user.model")
const Team = require("../models/team.model")
const { sendRegisterEmail } = require("../services/email")
const { userRoles } = require("../data/roles")
const bcrypt = require("bcrypt")
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
        if (password) {
            password = await bcrypt.hash(password, 9)
        }
        await User.findByIdAndUpdate(user._id, {
            name,
            email,
            password
        })
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.createFleetManager = async (req, res) => {
    const company = req.company
    if (!company) return error(res, 400, "company id is required")
    const { email, teamId } = req.body
    try {
        const isFound = await User.findOne({ email })
        if (isFound) return error(res, 400, "Email is already in use")

        const team = await Team.findOne({ teamId, companyId: company._id })
        if (!team) return error(res, 404, "team not found")

        const user = await User.create({
            email,
            companyId: company._id,
            teamId,
            roles: [userRoles.FLEET_MANAGER]
        })
        await Team.findByIdAndUpdate(teamId, { managerId: user._id })
        success(res, 201)
        sendRegisterEmail({ email, password: "123456789" })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}
