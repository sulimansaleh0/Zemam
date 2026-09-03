const { body } = require("express-validator");
const { expenseRecordStatus } = require("../data/status");

exports.verifyRecordSchema = [
    body("recordId")
        .trim()
        .notEmpty()
        .withMessage("Fuel record ID is required")
        .isMongoId()
        .withMessage("Invalid fuel record ID"),

    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(Object.values(expenseRecordStatus))
        .withMessage("Invalid fuel record status"),
]