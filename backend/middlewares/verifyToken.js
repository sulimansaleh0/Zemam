// backend/middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const { error } = require("../utils/responses");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return error(res, 401, "Token Required");
        
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = user;
        return next();
    } catch (err) {
        // يتم إرجاع 401 بدلاً من رمي Unhandled Exception
        return error(res, 401, "Invalid or Expired Token");
    }
};