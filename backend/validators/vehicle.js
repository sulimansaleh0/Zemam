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
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("Tank capacity must be greater than zero"),
    body("fuelType")
        .optional()
        .isIn(["بنزين 91", "بنزين 95", "ديزل", "Diesel", "هجين", "Hybrid", "كهربائي", "EV"])
        .withMessage("Invalid fuel type"),

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
        .isIn([vehicleStatus.ACTIVE, vehicleStatus.INACTIVE, vehicleStatus.INMAINTENANCE])
        .withMessage("Invalid Vehicle status")
]

exports.assignDriverSchema = [
    body("driverId")
        .isMongoId()
        .withMessage("Invalid Driver ID")
]