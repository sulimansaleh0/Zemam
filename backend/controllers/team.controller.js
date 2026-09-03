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
        const trimmedName = name ? name.trim() : ""
        const existingTeam = await Team.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
            companyId: user.companyId,
            isDeleted: false
        })
        if (existingTeam) {
            return error(res, 400, "اسم الفريق مسجل بالفعل في شركتك")
        }

        if (managerId) {
            const isFleetManager = await User.findOne({ _id: managerId, companyId: user.companyId, role: userRoles.FLEET_MANAGER, isDeleted: false })
            if (!isFleetManager) return error(res, 400, "cant make a normal user as a fleet manager")

            const isInTeam = await Team.findOne({ managerId, companyId: user.companyId, isDeleted: false })
            if (isInTeam) return error(res, 400, "Already in a team")
        }
        const team = await Team.create({
            name: trimmedName,
            managerId,
            companyId: user.companyId
        })
        if (managerId)
            await User.findByIdAndUpdate(managerId, { teamId: team._id })
        if (Array.isArray(driversIds) && driversIds.length > 0) {
            await User.updateMany(
                { _id: { $in: driversIds }, companyId: user.companyId, role: userRoles.DRIVER },
                { teamId: team._id }
            )
        }
        if (Array.isArray(vehiclesIds) && vehiclesIds.length > 0) {
            await Vehicle.updateMany(
                { _id: { $in: vehiclesIds }, companyId: user.companyId },
                { teamId: team._id }
            )
        }
        const createdTeam = await Team.findById(team._id).populate("managerId", "name email status phone")
        success(res, 201, { team: createdTeam })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listTeams = async (req, res) => {
    const user = req.user
    try {
        let filters = {
            companyId: user.companyId,
            isDeleted: false
        }

        const teams = await Team.find(filters).populate("managerId", "name email status phone")
        success(res, 200, { teams })
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}

exports.listTeam = async (req, res) => {
    const user = req.user
    const teamId = req.teamId
    if (!teamId) return error(res, 400, "team Id is required")
    try {
        const team = await Team.findOne({ _id: teamId, companyId: user.companyId, isDeleted: false })
            .populate("managerId", "name email status phone")
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
        const team = await Team.findOneAndUpdate({ _id: teamId, companyId: user.companyId }, { isDeleted: true, managerId: null })
        if (!team) return error(res, 404, "Team not found")

        if (team.managerId) {
            await User.findByIdAndUpdate(team.managerId, { teamId: null })
        }
        await Promise.all([
            Vehicle.updateMany({ teamId: team._id }, { teamId: null, driverId: null }),
            User.updateMany({ teamId: team._id }, { teamId: null }),
        ])
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