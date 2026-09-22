const Team = require("../models/team.model");
const { userRoles } = require("../data/roles");
const { serverError, error } = require("../utils/responses");
const { mainStatus } = require("../data/status");

module.exports = async (req, res, next) => {
    const user = req.user;
    if (!user) return error(res, 401, "Unauthorized");
    let team = null
    try {
        const teamFilters = { companyId: user.companyId, status: mainStatus.ACTIVE, isDeleted: false }

        if (user.role === userRoles.FLEET_MANAGER || user.role === userRoles.DRIVER) {
            if (!user.teamId) return error(res, 403, "You are not assigned to any team")
            const found = await Team.findOne({ ...teamFilters, _id: user.teamId })
            if (!found) return error(res, 404, "Team not found")
            team = found
        }

        if (user.role === userRoles.ADMIN) {
            const _id = req.body?.teamId || req.params?.id || req.query?.teamId || null
            if (_id) {
                const found = await Team.findOne({ ...teamFilters, _id })
                if (!found) return error(res, 404, "Team not found")
                // console.log(found)
                team = found
            }
        }
        req.team = team
        req.teamId = team ? team._id : null
        next()
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}