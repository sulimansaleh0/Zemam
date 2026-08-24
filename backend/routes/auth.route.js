const router = require("express").Router()
const { body } = require("express-validator");

// Middlewares
const verifyToken = require("../middlewares/verifyToken")
const validate = require("../middlewares/validator")
const verifyRefreshToken = require("../middlewares/verifyRefreshToken");

// Controllers
const { login, signup, logout, googleLogin, verifyEmail, verifyOtp, resetPassword, refreshToken, onBoarding } = require("../controllers/auth.controller")

// Schemas
const { loginSchema, signupSchema } = require("../validators/user");

router.post("/login", loginSchema, validate, login)
router.post("/google", googleLogin)
router.post("/signup", signupSchema, validate, signup)
router.post("/logout", logout)

router.post("/onboarding", verifyToken, onBoarding)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOtp)
router.post(
    "/reset-password",
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter (A-Z)")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter (a-z)")
        .matches(/[0-9]/).withMessage("Password must contain at least one number (0-9)")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character (!@#$%^&*...)"),
    validate,
    resetPassword
)
router.post("/refresh-token", verifyRefreshToken, refreshToken)
module.exports = router