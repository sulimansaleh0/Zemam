const jwt = require("jsonwebtoken");
const User = require("../models/user.model")
const { mainStatus } = require("../data/status")
const { error } = require("../utils/responses");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return error(res, 401, "Token Required");

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = user;
        return next();
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