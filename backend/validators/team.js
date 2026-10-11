const { body, param } = require("express-validator");
const { mainStatus } = require("../data/status");

exports.createTeamSchema = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("اسم الفريق مطلوب")
    .isLength({ min: 2, max: 100 })
    .withMessage("يجب أن يكون اسم الفريق بين حرفين و 100 حرف"),

  body("managerId")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("معرّف مدير الأسطول غير صالح"),

  body("driversIds")
    .optional({ nullable: true })
    .isArray()
    .withMessage("قائمة السائقين يجب أن تكون مصفوفة معرّفات"),

  body("driversIds.*")
    .optional()
    .isMongoId()
    .withMessage("معرّف السائق غير صالح"),

  body("vehiclesIds")
    .optional({ nullable: true })
    .isArray()
    .withMessage("قائمة المركبات يجب أن تكون مصفوفة معرّفات"),

  body("vehiclesIds.*")
    .optional()
    .isMongoId()
    .withMessage("معرّف المركبة غير صالح"),
];

exports.updateTeamSchema = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("اسم الفريق لا يمكن أن يكون فارغاً")
    .isLength({ min: 2, max: 100 })
    .withMessage("يجب أن يكون اسم الفريق بين حرفين و 100 حرف"),

  body("status")
    .optional()
    .isIn([mainStatus.ACTIVE, mainStatus.INACTIVE])
    .withMessage("حالة الفريق غير صالحة"),
];

exports.assignResourcesSchema = [
  body(["driversIds", "driverIds"])
    .optional({ nullable: true })
    .isArray()
    .withMessage("يجب أن تكون قائمة السائقين مصفوفة معرّفات"),

  body(["vehiclesIds", "vehicleIds"])
    .optional({ nullable: true })
    .isArray()
    .withMessage("يجب أن تكون قائمة المركبات مصفوفة معرّفات"),
];