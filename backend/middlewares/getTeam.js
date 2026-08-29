const Team = require("../models/team.model");
const { serverError, error } = require("../utils/responses")

module.exports = async (req, res, next) => {
    const user = req.user
    const { teamId } = req.body || {}
    try {
        if (user.teamId || teamId) {
            let filters = { companyId: user.companyId }
            if (teamId)
                filters._id = user.teamId
            else if (user.teamId)
                filters._id = teamId

            const team = await Team.findOne(filters);
            if (!team) return error(res, 404, "Team not found")

            req.teamId = team._id
            next()
        }
        next()
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}