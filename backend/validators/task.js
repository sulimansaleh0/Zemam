const { body, param } = require("express-validator");

exports.createTaskSchema = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("وصف المهمة مطلوب")
    .isLength({ min: 10 })
    .withMessage("وصف المهمة يجب ألا يقل عن 10 أحرف"),

  body("vehicleId")
    .notEmpty()
    .withMessage("معرف المركبة مطلوب")
    .isMongoId()
    .withMessage("معرف المركبة غير صالح"),

  body("driverId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف السائق غير صالح"),

  body("teamId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف الفريق غير صالح"),

  body("startTime")
    .notEmpty()
    .withMessage("وقت انطلاق المهمة مطلوب")
    .isISO8601()
    .withMessage("صيغة وقت الانطلاق غير صحيحة"),

  body("expectedEndTime")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("صيغة وقت التسليم المتوقع غير صحيحة"),

  body("pickupLocation")
    .isObject()
    .withMessage("بيانات نقطة الانطلاق مطلوبة ككائن"),
  body("pickupLocation.address")
    .trim()
    .notEmpty()
    .withMessage("عنوان نقطة الانطلاق مطلوب"),
  body("pickupLocation.lat")
    .trim()
    .notEmpty()
    .withMessage("إحداثيات خط العرض لنقطة الانطلاق مطلوبة"),
  body("pickupLocation.lng")
    .trim()
    .notEmpty()
    .withMessage("إحداثيات خط الطول لنقطة الانطلاق مطلوبة"),

  body("deliveryLocation")
    .isObject()
    .withMessage("بيانات نقطة التسليم مطلوبة ككائن"),
  body("deliveryLocation.address")
    .trim()
    .notEmpty()
    .withMessage("عنوان نقطة التسليم مطلوب"),
  body("deliveryLocation.lat")
    .trim()
    .notEmpty()
    .withMessage("إحداثيات خط العرض لنقطة التسليم مطلوبة"),
  body("deliveryLocation.lng")
    .trim()
    .notEmpty()
    .withMessage("إحداثيات خط الطول لنقطة التسليم مطلوبة"),
];

exports.updateTaskSchema = [
  param("id")
    .isMongoId()
    .withMessage("معرف المهمة غير صالح"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("وصف المهمة يجب ألا يقل عن 10 أحرف"),

  body("vehicleId")
    .optional()
    .isMongoId()
    .withMessage("معرف المركبة غير صالح"),

  body("driverId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف السائق غير صالح"),

  body("teamId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("معرف الفريق غير صالح"),

  body("startTime")
    .optional()
    .isISO8601()
    .withMessage("صيغة وقت الانطلاق غير صحيحة"),

  body("expectedEndTime")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("صيغة وقت التسليم المتوقع غير صحيحة"),

  body("pickupLocation")
    .optional()
    .isObject()
    .withMessage("بيانات نقطة الانطلاق مطلوبة ككائن"),

  body("deliveryLocation")
    .optional()
    .isObject()
    .withMessage("بيانات نقطة التسليم مطلوبة ككائن"),
];

exports.declineTaskSchema = [
  param("id")
    .isMongoId()
    .withMessage("معرف المهمة غير صالح"),

  body("declineReason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("سبب الإلغاء يجب ألا يتجاوز 500 حرف"),
];
