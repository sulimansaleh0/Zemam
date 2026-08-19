const Team = require("../models/team.model")
const User = require("../models/user.model")
const { userRoles } = require("../data/roles")
const { sendRegisterEmail } = require("../services/email")

const { success, error, serverError } = require("../utils/responses")

exports.createTeam = async (req, res) => {
    const company = req.company
    if (!company) return error(res, 400, "company id is required")
    const { name } = req.body
    try {
        const team = await Team.create({
            name,
            companyId: company._id
        })
        success(res, 201)
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

exports.listTeams = async (req, res) => {
    const company = req.company
    if (!company) return error(res, 400, "company Id is required")
    try {
        const teams = await Team.find({ companyId: company._id })
        success(res, 200, { teams })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}