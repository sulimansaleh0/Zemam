const jwt = require("jsonwebtoken");
const { error, serverError } = require("../utils/responses");

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