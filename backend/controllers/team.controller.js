const Team = require("../models/team.model")
const User = require("../models/user.model")
const Vehicle = require("../models/vehicle.model")
const getStatics = require("../utils/getStatics")
const { userRoles } = require("../data/roles")
const { success, error, serverError } = require("../utils/responses")

exports.createTeam = async (req, res) => {
    const user = req.user
    const { name, managerId, driversIds, vehiclesIds } = req.body
    try {
        if (managerId) {
            const isFleetManager = await User.findOne({ _id: managerId, companyId: user.companyId, role: userRoles.FLEET_MANAGER })
            if (!isFleetManager) return error(res, 400, "cant make a normal user as a fleet manager")

            const isInTeam = await Team.findOne({ managerId, companyId: user.companyId })
            if (isInTeam) return error(res, 400, "Already in a team")
        }
        const team = await Team.create({
            name,
            managerId,
            companyId: user.companyId
        })
        if (managerId)
            await User.findByIdAndUpdate(managerId, { teamId: team._id })
        
        if (driversIds && Array.isArray(driversIds) && driversIds.length > 0) {
            await User.updateMany({ _id: { $in: driversIds } }, { teamId: team._id })
        }
        if (vehiclesIds && Array.isArray(vehiclesIds) && vehiclesIds.length > 0) {
            await Vehicle.updateMany({ _id: { $in: vehiclesIds } }, { teamId: team._id })
        }
        success(res, 201, { team })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listTeams = async (req, res) => {
    const user = req.user
    try {
        const teams = await Team.find({ companyId: user.companyId, isDeleted: false })
        success(res, 200, { teams })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listTeam = async (req, res) => {
    const user = req.user
    const teamId = req.params.id || req.teamId
    if (!teamId) return error(res, 400, "team Id is required")
    try {
        const team = await Team.findOne({ _id: teamId, companyId: user.companyId, isDeleted: false })
        if (!team) return error(res, 404, "Team not found")
        success(res, 200, { team })
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

        if (team.managerId) {
            await User.findByIdAndUpdate(team.managerId, { teamId: null })
        }

        success(res, 200)
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.teamStatics = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    try {
        const statics = await getStatics({ teamId, companyId: user.companyId })
        success(res, 200, { statics })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}