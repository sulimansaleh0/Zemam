const router = require("express").Router()
const { userRoles } = require("../data/roles")

const {
    me,
    updateProfile,
    changeUserStatus,
    createFleetManager,
    deleteFleetManager,
    listFleetManagers,
    removeFleetManager,
    assignManager,
    createDriver,
    deleteDriver,
    listDrivers,
    assignDriverToVehicle,
    removeDriverFromVehicle,
    setDriverToTeam,
    removeDriverFromTeam
} = require("../controllers/user.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createUserSchema, updateUserStatusSchema, assignManagerSchema } = require("../validators/user")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(checkSubscription())

// create Fleet Manager
router.post("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    createUserSchema,
    validate,
    getTeam,
    createFleetManager
)

// List Managers
router.get("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    listFleetManagers
)

// Assign Manager to a Team
router.patch("/fleet-manager/:id/assign-to-team",
    allowedTo(userRoles.ADMIN),
    assignManagerSchema,
    validate,
    assignManager
)

// Delete Manager from a Team
router.patch("/fleet-manager/:id/remove-from-team",
    allowedTo(userRoles.ADMIN),
    removeFleetManager
)

// delete Manager
router.delete(
    "/fleet-manager/:id",
    allowedTo(userRoles.ADMIN),
    deleteFleetManager
)

// Set Driver To Team
router.patch("/driver/:id/assign-to-team",
    allowedTo(userRoles.ADMIN),
    getTeam,
    setDriverToTeam
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

// Assign Driver to a vehicle
router.patch("/driver/:id/assign-to-vehicle",
    assignDriverToVehicle
)

// Remove Driver From Team
router.patch("/driver/:id/remove-from-team",
    allowedTo(userRoles.ADMIN),
    removeDriverFromTeam
)

// Remove Driver from a vehicle
router.patch("/driver/:id/remove-from-vehicle",
    removeDriverFromVehicle
)

// Delete Driver
router.delete("/driver/:id", deleteDriver)

// Update Status
router.patch("/:userId/status",
    updateUserStatusSchema,
    validate,
    getTeam,
    changeUserStatus
)

module.exports = router