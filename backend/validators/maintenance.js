const { body, param } = require("express-validator")
const { expenseRecordStatus } = require("../data/status")
const { maintenanceCategories, maintenancePriority } = require("../data")

exports.createMaintenanceSchema = [
    body("vehicleId")
        .trim()
        .notEmpty()
        .withMessage("معرف المركبة مطلوب")
        .isMongoId()
        .withMessage("معرف المركبة غير صالح"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage("وصف العطل أو الصيانة مطلوب"),
    body("cost")
        .if(body("status").equals(expenseRecordStatus.APPROVED))
        .notEmpty()
        .withMessage("التكلفة مطلوبة عند اعتماد طلب الصيانة")
        .bail()
        .isFloat({ min: 0 })
        .withMessage("التكلفة يجب أن تكون رقماً غير سالب"),
    body("category")
        .isIn(Object.values(maintenanceCategories))
        .withMessage("تصنيف الصيانة غير صالح"),
    body("priority")
        .customSanitizer((v) => (typeof v === "string" ? v.toLowerCase() : v))
        .isIn([maintenancePriority.HIGH, maintenancePriority.LOW])
        .withMessage("مستوى الأولوية غير صالح"),
    body("odometer")
        .optional({ values: "falsy" })
        .isFloat({ min: 0 })
        .withMessage("قراءة العداد يجب أن تكون رقماً غير سالب")
]

exports.verifyMaintenanceSchema = [
    param("id")
        .isMongoId()
        .withMessage("معرف سجل الصيانة غير صالح"),
    body("status")
        .isIn([expenseRecordStatus.APPROVED, expenseRecordStatus.DECLINED])
        .withMessage("حالة الطلب يجب أن تكون معتمدة أو مرفوضة"),
    body("cost")
        .optional({ values: "falsy" })
        .isFloat({ min: 0 })
        .withMessage("التكلفة يجب أن تكون رقماً غير سالب"),
    body("declineReason")
        .optional({ values: "falsy" })
        .trim()
        .isString()
        .withMessage("سبب الرفض يجب أن يكون نصياً"),
    body("isDriverFault")
        .optional()
        .isBoolean()
        .withMessage("قيمة مسؤولية السائق يجب أن تكون منطقية")
        .toBoolean(),
    body("driverId")
        .optional({ values: "falsy" })
        .isMongoId()
        .withMessage("معرف السائق غير صالح")
]