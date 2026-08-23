const Team = require("../models/team.model")

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

exports.updateTeam = async (req, res) => {
    const user = req.user
    const { name } = req.body
    const teamId = req.params.id || null
    if (!teamId) return error(res, 400, "team Id is required")
    try {
        const team = await Team.findOneAndUpdate({ _id: teamId, companyId: user.companyId }, { name })
        if (!team) return error(res, 404, "Team not found")
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.deleteTeam = async (req, res) => {
    const user = req.user
    const teamId = req.params.id || null
    if (!teamId) return error(res, 400, "team Id is required")
    try {
        const team = await Team.findOneAndUpdate({ _id: teamId, companyId: user.companyId }, { isDeleted: true })
        if (!team) return error(res, 404, "Team not found")
        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}