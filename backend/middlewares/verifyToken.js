const jwt = require("jsonwebtoken")
const { error } = require("../utils/responses")

module.exports = (req, res, next) => {
    const token = req.cookies.token
    if (!token) return error(res, 401, "Token Required")
        
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
    if (user) {
        req.user = user
        return next()
    }
    return error(res, 400, "Invalid Token")
}