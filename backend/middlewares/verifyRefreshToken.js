const { error, serverError } = require("../utils/responses")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const RefreshToken = require("../models/refreshToken.model")

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

module.exports = async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken || null
    if (!refreshToken) return error(res, 401, "Access denied!")
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY)
        if (!decoded.tokenId || !decoded.userId) {
            return error(res, 401, "Invalid refresh token structure")
        }

        const tokenDoc = await RefreshToken.findById(decoded.tokenId)
        if (!tokenDoc) return error(res, 400, "refresh token is not found")

        if (tokenDoc.revoked) {
            // Compromised token reuse detected: revoke all active sessions for this user
            await RefreshToken.updateMany({ userId: decoded.userId }, { revoked: true })
            return error(res, 401, "Token is revoked, please login again")
        }

        // Compare SHA-256 hash (with backwards compatibility for legacy bcrypt hashes)
        let isMatched = false;
        if (tokenDoc.tokenHash) {
            if (tokenDoc.tokenHash.length === 64 && /^[0-9a-f]+$/i.test(tokenDoc.tokenHash)) {
                isMatched = (tokenDoc.tokenHash === hashToken(refreshToken));
            } else {
                const bcrypt = require("bcrypt");
                isMatched = await bcrypt.compare(refreshToken, tokenDoc.tokenHash);
            }
        }

        if (!isMatched) return error(res, 401, "invalid Token")

        req.userId = decoded.userId
        req.tokenId = decoded.tokenId
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