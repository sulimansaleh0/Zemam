const { body, param } = require("express-validator");
const { mainStatus } = require("../data/status");
const { vehicleTypes } = require("../data/vehicleTypes");

exports.createDriverSchema = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("البريد الإلكتروني مطلوب")
    .bail()
    .isEmail()
    .withMessage("صيغة البريد الإلكتروني غير صالحة")
    .normalizeEmail(),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("اسم السائق مطلوب")
    .bail()
    .isLength({ min: 2, max: 80 })
    .withMessage("يجب أن يكون اسم السائق بين حرفين و 80 حرفاً"),

  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("رقم الهاتف يجب أن يكون نصاً صالحاً"),

  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("رقم رخصة القيادة مطلوب")
    .bail()
    .isString()
    .withMessage("رقم الرخصة يجب أن يكون نصاً")
    .bail()
    .matches(/^[\p{L}\p{N}_\-\s]+$/u)
    .withMessage("رقم الرخصة يجب أن يحتوي على أحرف وأرقام فقط"),

  body("licenseTypes")
    .optional({ values: "falsy" })
    .isArray({ min: 1 })
    .withMessage("يجب تحديد فئة قيادة واحدة على الأقل")
    .bail()
    .custom((types) => types.every((t) => Object.values(vehicleTypes).includes(t)))
    .withMessage("فئة رخصة القيادة غير صالحة"),

  body("licenseExpiry")
    .notEmpty()
    .withMessage("تاريخ انتهاء رخصة القيادة مطلوب")
    .bail()
    .isISO8601()
    .withMessage("صيغة تاريخ انتهاء الرخصة غير صالحة"),

  body("teamId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف الفريق غير صالح"),

  body("vehicleId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف المركبة غير صالح"),
];

exports.updateDriverStatusSchema = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("حالة الحساب مطلوبة")
    .bail()
    .isIn([mainStatus.ACTIVE, mainStatus.INACTIVE])
    .withMessage("حالة الحساب غير صالحة (مسموح: نشط أو معطل فقط)"),
];

exports.assignDriverToVehicleSchema = [
  body("vehicleId")
    .trim()
    .notEmpty()
    .withMessage("معرف المركبة مطلوب")
    .bail()
    .isMongoId()
    .withMessage("معرف المركبة غير صالح"),
];

exports.assignDriverToTeamSchema = [
  body("teamId")
    .trim()
    .notEmpty()
    .withMessage("معرف الفريق مطلوب")
    .bail()
    .isMongoId()
    .withMessage("معرف الفريق غير صالح"),
];
