const Team = require("../models/team.model");
const { userRoles } = require("../data/roles");
const { serverError, error } = require("../utils/responses")

module.exports = async (req, res, next) => {
    const user = req.user
    const teamId = req.body?.teamId || req.params?.id || null

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