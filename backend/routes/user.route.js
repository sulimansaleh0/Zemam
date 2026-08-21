const router = require("express").Router()
const { userRoles } = require("../data/roles")

const { me, updateProfile, createFleetManager, createDriver } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createFleetManagerSchema, createDriverSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(checkSubscription())

router.post("/create-fleet-manager",
    allowedTo(userRoles.ADMIN),
    createFleetManagerSchema,
    validate,
    createFleetManager)

router.post("/create-driver",
    allowedTo(userRoles.FLEET_MANAGER),
    createDriverSchema,
    validate,
    createDriver)

module.exports = router