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