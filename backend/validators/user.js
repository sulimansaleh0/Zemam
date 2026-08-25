const { body } = require("express-validator");

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
        .isLength({ min: 6 }).withMessage("Company Name must be 6 characters at least")
];

exports.updateProfileSchema = [
    body("name")
        .trim()
        .optional()
        .isLength({ min: 6 }).withMessage("Name must be 6 characters at least"),

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
]

exports.createFleetManagerSchema = [
    body("teamId")
        .trim()
        .notEmpty()
        .withMessage("Team ID is required")
        .isMongoId()
        .withMessage("Invalid Team ID"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),
]

exports.createDriverSchema = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),
]