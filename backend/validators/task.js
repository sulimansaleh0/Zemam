const { body } = require("express-validator")

exports.createTaskSchema = [
    body("description")
        .trim()
        .notEmpty().withMessage("Description is Required")
        .isLength({ min: 15 }).withMessage("Description must be 15 charactes at least"),

    body("driverId")
        .notEmpty()
        .withMessage("driver id is required")
        .isMongoId()
        .withMessage("Invalid Driver Id"),

    body("vehicleId")
        .notEmpty()
        .withMessage("Vehicle Id is required")
        .isMongoId()
        .withMessage("Invalid Vehicle Id"),
]