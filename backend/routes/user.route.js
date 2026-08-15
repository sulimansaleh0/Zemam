const router = require("express").Router()

const { me, updateProfile } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const validator = require("../middlewares/validator")
const { updateProfileSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validator, updateProfile);

module.exports = router