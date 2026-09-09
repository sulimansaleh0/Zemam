const Team = require("../models/team.model");
const { userRoles } = require("../data/roles");
const { serverError, error } = require("../utils/responses")

module.exports = async (req, res, next) => {
    const isTeamRoute = req.baseUrl?.endsWith("/team") || req.baseUrl?.endsWith("/teams");
    const paramTeamId = req.params?.teamId || (isTeamRoute ? req.params?.id : null);
    const teamId = req.body?.teamId || req.query?.teamId || paramTeamId || null;
    if (user.role === userRoles.FLEET_MANAGER && !user.teamId)
        return error(res, 403, "You are not assigned to any team")

    try {
        if (user.teamId || teamId) {
            let filters = { companyId: user.companyId, isDeleted: false }
            if (user.teamId)
                filters._id = user.teamId
            else if (teamId)
                filters._id = teamId

            const team = await Team.findOne(filters);
            if (!team) return error(res, 404, "Team not found")

            req.teamId = team._id
            return next()
        }
        req.teamId = null
        next()
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}