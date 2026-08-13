const router = require("express").Router()

// Middlewares
const validate = require("../middlewares/validator")

// Controllers
const { login, signup, logout, googleLogin, verifyEmail } = require("../controllers/user.controller")

// Schemas
const { loginSchema, signupSchema } = require("../validators/user")

router.post("/login", loginSchema, validate, login)
router.post("/google", googleLogin)
router.post("/signup", signupSchema, validate, signup)
router.post("/logout", logout)
router.post("/verify-email", verifyEmail)

module.exports = router