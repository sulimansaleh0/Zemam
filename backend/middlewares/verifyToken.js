const jwt = require("jsonwebtoken");
const User = require("../models/user.model")
const { mainStatus } = require("../data/status")
const { error, serverError } = require("../utils/responses");

module.exports = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return error(res, 401, "Token Required");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded._id)
        if (!user) return error(res, 404, "User Not Found")
        if (user.status == mainStatus.ACTIVE) {
            req.user = user;
            return next();
        }
        return error(res, 401, "You are not active")
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return error(res, 401, "access token expired");
        }

        if (err.name === "JsonWebTokenError") {
            return error(res, 401, "Invalid access token");
        }

        console.error(err);
        return serverError(res);
    }
};