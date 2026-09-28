const { body, param } = require("express-validator")
const { expenseRecordStatus } = require("../data/status")

exports.createFuelSchema = [
    body("vehicleId")
        .isMongoId()
        .withMessage("Invalid vehicle ID"),
    body("isFullTank")
        .exists()
        .withMessage("Refill tank status is required")
        .bail()
        .isBoolean()
        .withMessage("Refill tank status must be FULL or NOT FULL")
        .bail()
        .toBoolean(),
    body("cost")
        .isFloat({ min: 0 })
        .withMessage("Cost must be a non-negative number"),
    body("qty")
        .isFloat({ gt: 0 })
        .withMessage("Quantity must be greater than zero"),
]

exports.verifyFuelSchema = [
    param("id")
        .isMongoId()
        .withMessage("Invalid fuel record ID"),
    body("status")
        .isIn([expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED])
        .withMessage("Status must be approved or declined"),
]