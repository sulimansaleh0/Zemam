const { body } = require("express-validator");
const { mainStatus } = require("../data/status")
const { vehicleTypes } = require("../data/vehicleTypes")

exports.loginSchema = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
];

exports.signupSchema = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is Required")
        .isLength({ min: 6 }).withMessage("Name must be at least 6 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter (A-Z)")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter (a-z)")
        .matches(/[0-9]/).withMessage("Password must contain at least one number (0-9)")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character (!@#$%^&*...)"),

    body("confirmPassword")
        .trim()
        .notEmpty().withMessage("confirm Password is required"),

    body("companyName")
        .trim()
        .notEmpty().withMessage("Company Name is required")
        .isLength({ min: 6 }).withMessage("Company Name must be 6 charactes at least")
]

exports.updateProfileSchema = [
    body("name")
        .trim()
        .optional()
        .isLength({ min: 6 }).withMessage("Name must be 6 charactes at least"),

    body("email")
        .trim()
        .optional()
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .trim()
        .optional()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter (A-Z)")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter (a-z)")
        .matches(/[0-9]/).withMessage("Password must contain at least one number (0-9)")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character (!@#$%^&*...)")
    ,
    body("licenseNumber")
        .optional({ values: "falsy" })
        .trim()
        .isString()
        .withMessage("License number must be a string"),

    body("licenseTypes")
        .optional({ values: "falsy" })
        .isArray({ min: 1 })
        .withMessage("License types must be a non-empty array")
        .custom((types) => types.every((type) => Object.values(vehicleTypes).includes(type)))
        .withMessage("Invalid license type"),

    body("licenseExpiry")
        .optional({ values: "falsy" })
        .isISO8601()
        .withMessage("License expiry must be a valid date"),
]

exports.resetPasswordSchema = [
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter (A-Z)")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter (a-z)")
        .matches(/[0-9]/).withMessage("Password must contain at least one number (0-9)")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character (!@#$%^&*...)")
]

exports.companyNameSchema = [
    body("companyName")
        .trim()
        .notEmpty()
        .withMessage("Company Name is required")
        .isLength({ min: 6 })
        .withMessage("Company Name should be more than 5 words")
]

exports.updateUserStatusSchema = [
    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(Object.values(mainStatus))
        .withMessage("Invalid status"),
];

exports.assignManagerSchema = [
    body("teamId")
        .notEmpty()
        .withMessage("Team Id is required")
        .isMongoId()
        .withMessage("Invalid Team Id")
]

exports.createUserSchema = [
    body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email Is required")
        .isEmail()
        .withMessage("Not valid email"),
    body("name")
        .optional({ values: "falsy" })
        .trim()
        .isString()
        .withMessage("Name must be a string"),
    body("phone")
        .optional({ values: "falsy" })
        .trim(),
];