const Team = require("../models/team.model");
const { userRoles } = require("../data/roles");
const { serverError, error } = require("../utils/responses");
const { mainStatus } = require("../data/status");

module.exports = async (req, res, next) => {
    const user = req.user;
    if (!user) return error(res, 401, "Unauthorized");
    let teamId = null
    try {
        const teamFilters = { companyId: user.companyId, status: mainStatus.ACTIVE, isDeleted: false }

        if (user.role === userRoles.FLEET_MANAGER || user.role === userRoles.DRIVER) {
            if (!user.teamId) return error(res, 403, "You are not assigned to any team")
            const team = await Team.findOne({ ...teamFilters, _id: user.teamId })
            if (!team) return error(res, 404, "Team not found")
            teamId = team._id
        }

        if (user.role === userRoles.ADMIN) {
            const _id = req.params.id || req.body.teamId || req.query.teamId || null
            if (_id) {
                const team = await Team.findOne({ ...teamFilters, _id })
                if (!team) return error(res, 404, "Team not found")
                teamId = team._id
            }
        }
        req.teamId = teamId
        next()
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}