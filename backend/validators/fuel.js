const { body, param } = require("express-validator")
const { expenseRecordStatus } = require("../data/status")

exports.createFuelSchema = [
    body("vehicleId")
        .isMongoId()
        .withMessage("Invalid vehicle ID"),
    body("cost")
        .isFloat({ min: 0 })
        .withMessage("Cost must be a non-negative number"),
    body("qty")
        .isFloat({ gt: 0 })
        .withMessage("Quantity must be greater than zero"),
    body("odometer")
        .isFloat({ min: 0 })
        .withMessage("Odometer must be a non-negative number"),
    body("isFullTank")
        .isBoolean()
        .withMessage("isFullTank is required")
        .toBoolean(),
]

exports.verifyFuelSchema = [
    param("id")
        .isMongoId()
        .withMessage("Invalid fuel record ID"),
    body("status")
        .isIn([expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED])
        .withMessage("Status must be approved or declined"),
]