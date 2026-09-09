const { body } = require("express-validator");
const { mainStatus } = require("../data/status");
const { vehicleTypes } = require("../data/vehicleTypes");

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

    body("vehicleType")
        .optional()
        .isIn(Object.values(vehicleTypes))
        .withMessage("Invalid vehicle type"),

    body("currentOdometer")
        .notEmpty()
        .withMessage("Current odometer is required")
        .isFloat({ min: 0 })
        .withMessage("Current odometer must be a non-negative number"),

    body("expectedFuelEfficiency")
        .notEmpty()
        .isFloat({ gt: 0 })
        .withMessage("Expected fuel efficiency must be greater than zero")
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