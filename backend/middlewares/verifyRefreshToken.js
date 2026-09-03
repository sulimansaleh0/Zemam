const { error, serverError, success } = require("../utils/responses")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const RefreshToken = require("../models/refreshToken.model")

module.exports = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken || null
    if (!refreshToken) return error(res, 401, "Access denied!")
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY)

        const tokenDoc = await RefreshToken.findOne({ _id: decoded.tokenId })
        if (!tokenDoc) return error(res, 400, "refresh token is not found")

        if (tokenDoc.revoked) {
            await RefreshToken.updateMany({ userId: decoded.userId }, { revoked: true })
            return error(res, 401, "Token is revoked, please login again")
        }

        const isMatched = await bcrypt.compare(refreshToken, tokenDoc.tokenHash)
        if (!isMatched) return error(res, 401, "invalid Token")

        req.userId = decoded.userId
        return next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return error(res, 401, "Refresh token expired");
        }

        if (err.name === "JsonWebTokenError") {
            return error(res, 401, "Invalid refresh token");
        }

        console.error(err);
        return serverError(res);
    }
}