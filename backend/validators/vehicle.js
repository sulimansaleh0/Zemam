const { body } = require("express-validator");
const { mainStatus } = require("../data/status");

exports.createVehicleSchema = [
    body("model")
        .trim()
        .notEmpty()
        .withMessage("Vehicle model is required")
        .isString()
        .withMessage("Vehicle model must be a string"),

    body("year")
        .notEmpty()
        .withMessage("Vehicle year is required")
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("Vehicle year must be a valid year"),

    body("plateNumber")
        .trim()
        .notEmpty()
        .withMessage("Plate number is required")
        .isNumeric()
        .withMessage("Plate number must be a number"),

    body("teamId")
        .optional({ nullable: true, checkFalsy: true })
        .isMongoId()
        .withMessage("Invalid Team ID"),
];

exports.updateVehicleStatusSchema = [
    body("status")
        .isIn(Object.values(mainStatus))
        .withMessage("Invalid Vehicle status")
]

exports.assignDriverSchema = [
    body("driverId")
        .isMongoId()
        .withMessage("Invalid Driver ID")
]