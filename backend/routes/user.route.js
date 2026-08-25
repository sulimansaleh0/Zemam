const router = require("express").Router()
const { userRoles } = require("../data/roles")

const { me, updateProfile, createFleetManager, createDriver, deleteFleetManager, deleteDriver, listFleetManagers, listDrivers, changeDriverStatus } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createFleetManagerSchema, createDriverSchema, updateUserStatusSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(checkSubscription())

router.post("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    createFleetManagerSchema,
    validate,
    createFleetManager
)

router.get("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    listFleetManagers
)

router.delete(
    "/fleet-manager/:id",
    allowedTo(userRoles.ADMIN),
    deleteFleetManager
)

router.get("/driver", listDrivers)

router.use(allowedTo(userRoles.FLEET_MANAGER))
router.post("/driver",
    createDriverSchema,
    validate,
    createDriver
)
router.patch("/driver/:id/status",
    updateUserStatusSchema,
    validate,
    changeDriverStatus
)
router.delete("/driver/:id", deleteDriver)

module.exports = router