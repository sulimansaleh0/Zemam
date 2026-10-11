const { body } = require("express-validator");
const { vehicleStatus } = require("../data/status");
const { vehicleTypes } = require("../data/vehicleTypes");

exports.createVehicleSchema = [
    body("model")
        .trim()
        .notEmpty()
        .withMessage("اسم وموديل المركبة مطلوب")
        .isString()
        .withMessage("اسم المركبة يجب أن يكون نصاً صالحاً"),

    body("year")
        .notEmpty()
        .withMessage("سنة الصنع مطلوبة")
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage("سنة الصنع يجب أن تكون رقماً صحيحاً صالحاً"),

    body("plateNumber")
        .trim()
        .notEmpty()
        .withMessage("رقم اللوحة مطلوب")
        .isString()
        .withMessage("رقم اللوحة يجب أن يكون نصاً صالحاً"),

    body("tankCapacity")
        .notEmpty()
        .withMessage("سعة خزان الوقود مطلوبة")
        .isFloat({ gt: 0 })
        .withMessage("سعة خزان الوقود يجب أن تكون أكبر من الصفر"),

    body("fuelType")
        .notEmpty()
        .withMessage("نوع الوقود مطلوب")
        .isIn(["بنزين 91", "بنزين 95", "ديزل", "Diesel", "هجين", "Hybrid", "كهربائي", "EV"])
        .withMessage("نوع الوقود غير صالح"),

    body("vehicleType")
        .notEmpty()
        .withMessage("فئة المركبة مطلوبة")
        .isIn(Object.values(vehicleTypes))
        .withMessage("فئة تصنيف المركبة غير صالحة"),

    body("expectedFuelEfficiency")
        .notEmpty()
        .isFloat({ gt: 0 })
        .withMessage("معدل كفاءة الوقود المتوقع يجب أن يكون أكبر من الصفر"),

    body("licenseNumber")
        .trim()
        .notEmpty()
        .withMessage("رقم رخصة السير (الاستمارة) مطلوب")
        .isString()
        .withMessage("رقم رخصة السير يجب أن يكون نصاً صالحاً"),

    body("licenseExpiry")
        .notEmpty()
        .withMessage("تاريخ انتهاء رخصة السير مطلوب")
        .isISO8601()
        .withMessage("تاريخ انتهاء رخصة السير يجب أن يكون تاريخاً صالحاً"),
];

exports.updateVehicleSchema = [
    body("model")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("اسم وموديل المركبة لا يمكن أن يكون فارغاً")
        .isString()
        .withMessage("اسم المركبة يجب أن يكون نصاً صالحاً"),

    body("year")
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage("سنة الصنع يجب أن تكون رقماً صحيحاً صالحاً"),

    body("plateNumber")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("رقم اللوحة لا يمكن أن يكون فارغاً")
        .isString()
        .withMessage("رقم اللوحة يجب أن يكون نصاً صالحاً"),

    body("tankCapacity")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("سعة خزان الوقود يجب أن تكون أكبر من الصفر"),

    body("fuelType")
        .optional()
        .isIn(["بنزين 91", "بنزين 95", "ديزل", "Diesel", "هجين", "Hybrid", "كهربائي", "EV"])
        .withMessage("نوع الوقود غير صالح"),

    body("vehicleType")
        .optional()
        .isIn(Object.values(vehicleTypes))
        .withMessage("فئة تصنيف المركبة غير صالحة"),

    body("expectedFuelEfficiency")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("معدل كفاءة الوقود المتوقع يجب أن يكون أكبر من الصفر"),

    body("licenseNumber")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("رقم رخصة السير لا يمكن أن يكون فارغاً")
        .isString()
        .withMessage("رقم رخصة السير يجب أن يكون نصاً صالحاً"),

    body("licenseExpiry")
        .optional()
        .isISO8601()
        .withMessage("تاريخ انتهاء رخصة السير يجب أن يكون تاريخاً صالحاً"),

    body("insuranceExpiry")
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601()
        .withMessage("تاريخ انتهاء التأمين يجب أن يكون تاريخاً صالحاً"),
];

exports.updateVehicleStatusSchema = [
    body("status")
        .isIn([vehicleStatus.ACTIVE, vehicleStatus.INACTIVE])
        .withMessage("حالة المركبة المحددة غير صالحة"),
];

exports.assignDriverSchema = [
    body("driverId")
        .isMongoId()
        .withMessage("معرف السائق غير صالح"),
];