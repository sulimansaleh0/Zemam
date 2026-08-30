const { body } = require("express-validator")

exports.createTeamSchema = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 6 })
        .withMessage("Name should be at least 6 charachters"),
    body("managerId")
        .optional({ nullable: true, checkFalsy: true })
        .isMongoId()
        .withMessage("Invalid Mongo Id"),
    body("driversIds")
        .optional()
        .isArray()
        .withMessage("driversIds must be an array"),
    body("vehiclesIds")
        .optional()
        .isArray()
        .withMessage("vehiclesIds must be an array"),
]