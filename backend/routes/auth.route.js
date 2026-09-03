const router = require("express").Router()
const { body } = require("express-validator");

// Middlewares
const verifyToken = require("../middlewares/verifyToken")
const validate = require("../middlewares/validator")
const verifyRefreshToken = require("../middlewares/verifyRefreshToken");

// Controllers
const { login, signup, logout, googleLogin, verifyEmail, verifyOtp, resetPassword, refreshToken, onBoarding } = require("../controllers/auth.controller")

// Schemas
const { loginSchema, signupSchema, resetPasswordSchema, companyNameSchema } = require("../validators/user");

router.post("/login", loginSchema, validate, login)
router.post("/google", googleLogin)
router.post("/signup", signupSchema, validate, signup)
router.post("/logout", logout)

router.post("/onboarding", verifyToken, companyNameSchema, validate, onBoarding)
router.post("/verify-email", verifyEmail)
router.post("/verify-otp", verifyOtp)
router.post(
    "/reset-password",
    resetPasswordSchema,
    validate,
    resetPassword
)
router.post("/refresh-token", verifyRefreshToken, refreshToken)
module.exports = router