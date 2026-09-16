const { body } = require("express-validator")

exports.createTaskSchema = [
    body("title")
        .optional()
        .trim(),

    body("description")
        .trim()
        .notEmpty().withMessage("Description is Required")
        .isLength({ min: 15 }).withMessage("Description must be 15 charactes at least"),

    body("driverId")
        .optional({ values: "falsy" })
        .isMongoId()
        .withMessage("Invalid Driver Id"),

    body("vehicleId")
        .notEmpty()
        .withMessage("Vehicle Id is required")
        .isMongoId()
        .withMessage("Invalid Vehicle Id"),

    body("startTime")
        .notEmpty()
        .withMessage("Start time is required")
        .isISO8601()
        .withMessage("Invalid start time"),
    body("expectedEndTime")
        .optional()
        .isISO8601()
        .withMessage("Invalid expected end time"),
    body("startOdometer")
        .optional()
        .isFloat({ min: 0 }),
    body("endOdometer")
        .optional()
        .isFloat({ min: 0 }),

    body("pickupLocation")
        .isObject()
        .withMessage("Pickup location is required"),
    body("pickupLocation.address")
        .trim()
        .notEmpty()
        .withMessage("Pickup address is required"),
    body("pickupLocation.lat")
        .trim()
        .notEmpty()
        .withMessage("Pickup latitude is required"),
    body("pickupLocation.lng")
        .trim()
        .notEmpty()
        .withMessage("Pickup longitude is required"),

    body("deliveryLocation")
        .isObject()
        .withMessage("Delivery location is required"),
    body("deliveryLocation.address")
        .trim()
        .notEmpty()
        .withMessage("Delivery address is required"),
    body("deliveryLocation.lat")
        .trim()
        .notEmpty()
        .withMessage("Delivery latitude is required"),
    body("deliveryLocation.lng")
        .trim()
        .notEmpty()
        .withMessage("Delivery longitude is required"),
]

exports.finishTaskSchema = [
    body("endOdometer")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("End odometer must be a non-negative number")
]