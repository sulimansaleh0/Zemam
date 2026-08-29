const router = require("express").Router()
const { userRoles } = require("../data/roles")

const { me, updateProfile, createFleetManager, createDriver, deleteFleetManager, deleteDriver, listFleetManagers, listDrivers, changeUserStatus, disableFleetManager, assignManager, disableDriver, assignDriver } = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createUserSchema, updateUserStatusSchema, assignManagerSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

// Update Status
router.patch("/:id/status",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    updateUserStatusSchema,
    validate,
    getTeam,
    changeUserStatus
)

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

// Assign Driver to a Car
router.post("/driver/:id/assign",
    assignDriver
)

// Delete Driver from a Car
router.post("/driver/:id/disable",
    disableDriver
)

// Delete Driver
router.delete("/driver/:id", deleteDriver)

module.exports = router