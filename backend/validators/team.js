const { body } = require("express-validator")

exports.createTeamSchema = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 6 })
        .withMessage("Name should be at least 6 charachters"),
    body("managerId")
        .optional()
        .isMongoId()
        .withMessage("Invalid Mongo Id"),
]