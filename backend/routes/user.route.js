const router = require("express").Router()
const { userRoles } = require("../data/roles")

const { me, updateProfile, createFleetManager, createDriver, deleteFleetManager, deleteDriver, listFleetManagers, listDrivers, changeDriverStatus, disableFleetManager, assignManager } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createUserSchema, updateUserStatusSchema, assignManagerSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

// create Fleet Manager
router.post("/fleet-manager",
    createUserSchema,
    validate,
    getTeam,
    createFleetManager
)

// List Managers
router.get("/fleet-manager",
    listFleetManagers
)

// Assign Manager to a Team
router.post("/fleet-manager/:id/assign",
    assignManagerSchema,
    validate,
    assignManager
)

// Delete Manager from a Team
router.post("/fleet-manager/:id/disable",
    disableFleetManager
)

// delete Manager
router.delete(
    "/fleet-manager/:id",
    getTeam,
    deleteFleetManager
)

router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))
router.use(getTeam)

// Create Driver
router.post("/driver",
    createUserSchema,
    validate,
    createDriver
)

// Get Drivers
router.get("/driver", listDrivers)

// Update Driver Status
router.patch("/driver/:id/status",
    updateUserStatusSchema,
    validate,
    changeDriverStatus
)

// Delete Driver
router.delete("/driver/:id", deleteDriver)

module.exports = router