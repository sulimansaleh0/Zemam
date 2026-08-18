const router = require("express").Router()
const { body } = require("express-validator");

// Middlewares
const validate = require("../middlewares/validator")

// Controllers
const { login, signup, logout, googleLogin, verifyEmail, verifyOtp, resetPassword } = require("../controllers/auth.controller")

// Schemas
const { loginSchema, signupSchema } = require("../validators/user")

router.post("/login", loginSchema, validate, login)
router.post("/google", googleLogin)
router.post("/signup", signupSchema, validate, signup)
router.post("/logout", logout)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOtp)
router.post(
    "/reset-password",
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validate,
    resetPassword
)

module.exports = router