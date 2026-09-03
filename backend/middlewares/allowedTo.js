const { error, serverError } = require("../utils/responses")

module.exports = (...roles) =>
    (req, res, next) => {
        const user = req.user
        if (!user) return error(res, 401, "unAuthorized")
        const userRole = user.role || ""
        const hasAccess = roles.includes(userRole)

        if (!hasAccess) {
            return error(res, 403, "Access Denied");
        }

        next();
    }