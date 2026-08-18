const { error, serverError } = require("../utils/responses")

module.exports = (...roles) =>
    (req, res, next) => {
        const user = req.user
        if (!user) return error(res, 401, "unAuthorized")
        const userRoles = user.roles || []
        
        const hasAccess = userRoles.some(role =>
            roles.includes(role)
        );

        if (!hasAccess) {
            return error(res, 403, "Access Denied");
        }

        next();
    }