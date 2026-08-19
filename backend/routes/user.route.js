const router = require("express").Router()
const { userRoles } = require("../data/roles")

const { me, updateProfile, createFleetManager } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createFleetManagerSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

router.post("/create-fleet-manager", createFleetManagerSchema, validate, createFleetManager)

module.exports = router