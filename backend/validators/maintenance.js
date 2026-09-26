const { body, param } = require("express-validator")
const { expenseRecordStatus } = require("../data/status")
const { maintenanceCategories, maintenancePriority } = require("../data")
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
        .optional({ values: "falsy" })
        .isFloat({ min: 0 })
        .withMessage("Cost must be a non-negative number"),
    body("category")
        .isIn(Object.values(maintenanceCategories))
        .withMessage("Invalid maintenance category"),
    body("odometer")
        .optional({ values: "falsy" })
        .isFloat({ min: 0 })
        .withMessage("Odometer must be a non-negative number"),
    body("priority")
        .isIn([maintenancePriority.HIGH, maintenancePriority.LOW])
        .withMessage("Invalid priority")
]

exports.verifyMaintenanceSchema = [
    param("id")
        .isMongoId()
        .withMessage("Invalid maintenance record ID"),
    body("status")
        .isIn([expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED])
        .withMessage("Status must be approved or declined"),
    body("cost")
        .optional({ values: "falsy" })
        .isNumeric()
        .withMessage("cost must be a number"),
    body("declineReason")
        .optional({ values: "falsy" })
        .trim()
        .isString()
        .withMessage("Decline reason must be a string"),
    body("isDriverFault")
        .optional()
        .isBoolean()
        .withMessage("isDriverFault must be a boolean")
        .toBoolean()
]