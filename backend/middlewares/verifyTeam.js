const Team = require("../models/team.model")
const { userRoles } = require("../data/roles")
const { error, serverError } = require("../utils/responses")

module.exports = async (req, res, next) => {
    const user = req.user
    // إذا كان المستخدم Admin، يُسمح له بالمرور على مستوى الشركة بالكامل
    if (!user.teamId && user.roles?.includes(userRoles.ADMIN)) {
        return next()
    }
    const teamId = user.teamId
    if (!teamId) return error(res, 400, "Team Id is required")
    try {
        const team = await Team.findById(teamId)
        if (!team) return error(res, 404, "Team not found")
        if (team.isDeleted) return error(res, 400, "Team is deleted")
        return next()
    } catch (err) {
        console.log(err)
        serverError(res)
    }
}