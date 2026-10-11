const { body } = require('express-validator');
const { mainStatus } = require('../data/status');

/**
 * مخطط التحقق من إضافة مدير أسطول جديد
 */
exports.createFleetManagerSchema = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('البريد الإلكتروني لمدير الأسطول مطلوب')
    .isEmail()
    .withMessage('يرجى إدخال بريد إلكتروني صحيح وصالح'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('اسم مدير الأسطول مطلوب')
    .isLength({ min: 2, max: 60 })
    .withMessage('يجب أن يتراوح اسم المدير بين حرفين و 60 حرفاً'),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .withMessage('رقم الجوال المدخل غير صحيح'),

  body('teamId')
    .optional({ values: 'falsy' })
    .trim()
    .isMongoId()
    .withMessage('معرف الفريق التشغيلي غير صالح'),
];

/**
 * مخطط التحقق من تعيين مدير أسطول لفريق
 */
exports.assignManagerSchema = [
  body('teamId')
    .trim()
    .notEmpty()
    .withMessage('معرف الفريق مطلوب لتعيين المدير')
    .isMongoId()
    .withMessage('معرف الفريق التشغيلي غير صالح'),
];

/**
 * مخطط التحقق من تعديل حالة حساب مدير الأسطول
 */
exports.updateManagerStatusSchema = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('حالة الحساب مطلوبة')
    .isIn(Object.values(mainStatus))
    .withMessage('حالة الحساب المحددة غير صالحة، يجب أن تكون نشط أو غير نشط'),
];
