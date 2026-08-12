const router = require("express").Router()

// Middlewares
const validate = require("../middlewares/validator")

// Controllers
const { login, signup, logout } = require("../controllers/user.controller")

// Schemas
const { loginSchema, signupSchema } = require("../validators/user")

router.post("/login", loginSchema, validate, login)
router.post("/signup", signupSchema, validate, signup)
router.post("/logout", logout)

module.exports = router