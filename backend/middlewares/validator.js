const { validationResult } = require("express-validator");
const { error } = require("../utils/responses")

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return error(res,
            400,
            errors.array().map(err => (err.msg)).join(", ")
        );
    }
    next();
}