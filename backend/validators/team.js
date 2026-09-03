const { body } = require("express-validator")

exports.createTeamSchema = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 5 })
        .withMessage("Name should be at least 5 characters"),
]