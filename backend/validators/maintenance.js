const { body, param } = require("express-validator")
const { expenseRecordStatus } = require("../data/status")

exports.createMaintenanceSchema = [
    body("vehicleId")
        .trim()
        .notEmpty()
        .withMessage("Vehicle ID is required")
        .isMongoId()
        .withMessage("Invalid vehicle ID"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),
    body("cost")
        .notEmpty()
        .withMessage("Cost is required")
        .isFloat({ min: 0 })
        .withMessage("Cost must be a non-negative number"),
]

exports.verifyMaintenanceSchema = [
    param("id")
        .isMongoId()
        .withMessage("Invalid maintenance record ID"),
    body("status")
        .isIn([expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED])
        .withMessage("Status must be approved or declined"),
    body("declineReason")
        .optional()
        .trim()
        .isString()
        .withMessage("Decline reason must be a string"),
    body("isDriverFault")
        .optional()
        .isBoolean()
        .withMessage("isDriverFault must be a boolean")
        .toBoolean()
]