const { body, param } = require("express-validator")
const { expenseRecordStatus } = require("../data/status")

exports.createFuelSchema = [
    body("vehicleId")
        .isMongoId()
        .withMessage("معرف المركبة غير صالح"),
    body("isFullTank")
        .exists()
        .withMessage("حالة امتلاء الخزان بعد التعبئة مطلوبة")
        .bail()
        .isBoolean()
        .withMessage("حالة امتلاء الخزان يجب أن تكون قيمة منطقية (ممتلئ أو غير ممتلئ)")
        .bail()
        .toBoolean(),
    body("cost")
        .isFloat({ min: 0 })
        .withMessage("يجب أن تكون تكلفة الوقود رقماً موجباً أو صفراً"),
    body("qty")
        .isFloat({ gt: 0 })
        .withMessage("يجب أن تكون كمية الوقود المعبأة أكبر من صفر"),
    body("odometer")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("قراءة العداد يجب أن تكون رقماً موجباً أو صفراً")
        .toFloat(),
]

exports.verifyFuelSchema = [
    param("id")
        .isMongoId()
        .withMessage("معرف إيصال الوقود غير صالح"),
    body("status")
        .isIn([expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED])
        .withMessage("حالة الإيصال يجب أن تكون إما معتمد (approved) أو مرفوض (declined)"),
]

exports.voidFuelSchema = [
    param("id")
        .isMongoId()
        .withMessage("معرف إيصال الوقود غير صالح"),
    body("reason")
        .optional()
        .isString()
        .withMessage("سبب إلغاء الاعتماد يجب أن يكون نصاً")
        .trim(),
]