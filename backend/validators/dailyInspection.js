const { body, param, query } = require("express-validator");

exports.createDailyInspectionSchema = [
  body("vehicleId")
    .trim()
    .notEmpty()
    .withMessage("معرف المركبة مطلوب")
    .isMongoId()
    .withMessage("معرف المركبة غير صالح"),
  body("taskId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف المهمة غير صالح"),
  body("odometer")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("قراءة العداد يجب أن تكون رقماً غير سالب"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("يجب إرسال بنود الفحص اليومي كمصفوفة تحتوي على بند واحد على الأقل"),
  body("items.*.id")
    .trim()
    .notEmpty()
    .withMessage("معرف بند الفحص مطلوب"),
  body("items.*.label")
    .trim()
    .notEmpty()
    .withMessage("اسم بند الفحص مطلوب"),
  body("items.*.passed")
    .isBoolean()
    .withMessage("حالة فحص البند يجب أن تكون منطقية (true/false)"),
  body("notes")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("الملاحظات يجب أن تكون نصاً"),
];

exports.getVehicleInspectionSchema = [
  param("vehicleId")
    .isMongoId()
    .withMessage("معرف المركبة غير صالح"),
];
