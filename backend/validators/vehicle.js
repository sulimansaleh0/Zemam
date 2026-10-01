const { body } = require("express-validator");
const { mainStatus, vehicleStatus } = require("../data/status");
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
        .isString()
        .withMessage("Plate number must be a string"),
    body("tankCapacity")
        .notEmpty()
        .withMessage("Tank capacity is required")
        .isFloat({ gt: 0 })
        .withMessage("Tank capacity must be greater than zero"),
    body("fuelType")
        .notEmpty()
        .withMessage("Fuel type is required")
        .isIn(["بنزين 91", "بنزين 95", "ديزل", "Diesel", "هجين", "Hybrid", "كهربائي", "EV"])
        .withMessage("Invalid fuel type"),

    body("vehicleType")
        .notEmpty()
        .withMessage("Vehicle type is required")
        .isIn(Object.values(vehicleTypes))
        .withMessage("Invalid vehicle type"),
    body("expectedFuelEfficiency")
        .notEmpty()
        .isFloat({ gt: 0 })
        .withMessage("Expected fuel efficiency must be greater than zero"),
    body("licenseNumber")
        .trim()
        .notEmpty()
        .withMessage("License number is required")
        .isString()
        .withMessage("License number must be a string"),
    body("licenseExpiry")
        .notEmpty()
        .withMessage("License expiry is required")
        .isISO8601()
        .withMessage("License expiry must be a valid date")
];

exports.updateVehicleStatusSchema = [
    body("status")
        .isIn([vehicleStatus.ACTIVE, vehicleStatus.INACTIVE])
        .withMessage("Invalid Vehicle status")
]

exports.assignDriverSchema = [
    body("driverId")
        .isMongoId()
        .withMessage("Invalid Driver ID")
]