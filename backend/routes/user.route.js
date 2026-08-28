const router = require("express").Router()
const { userRoles } = require("../data/roles")

const { me, updateProfile, createFleetManager, createDriver, deleteFleetManager, deleteDriver, listFleetManagers, listDrivers, changeDriverStatus } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createUserSchema, updateUserStatusSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

router.post("/fleet-manager",
    createUserSchema,
    validate,
    getTeam,
    createFleetManager
)

router.get("/fleet-manager",
    listFleetManagers
)

router.delete(
    "/fleet-manager/:id",
    getTeam,
    deleteFleetManager
)

router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))
router.use(getTeam)

router.post("/driver",
    createUserSchema,
    validate,
    createDriver
)
router.get("/driver", listDrivers)
router.patch("/driver/:id/status",
    updateUserStatusSchema,
    validate,
    changeDriverStatus
)
router.delete("/driver/:id", deleteDriver)

module.exports = router