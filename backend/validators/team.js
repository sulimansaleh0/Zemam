const { body } = require("express-validator")

exports.createTeamSchema = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name should be at least 2 characters"),
    body("managerId")
        .optional({ values: "falsy" })
        .isMongoId()
        .withMessage("Invalid Mongo Id"),
]