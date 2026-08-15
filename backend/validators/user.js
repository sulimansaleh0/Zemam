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
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

exports.signupSchema = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is Required")
        .isLength({ min: 6 }).withMessage("Name must be 6 charactes at least"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
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
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
]