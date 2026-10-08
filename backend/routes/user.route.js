const router = require("express").Router()
const { userRoles } = require("../data/roles")

const {
    me,
    updateProfile,
    createFleetManager,
    deleteFleetManager,
    listFleetManagers,
    getManagerStats,
    removeFleetManager,
    assignManager
} = require("../controllers/user.controller")
const driverController = require("../controllers/driver.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { updateProfileSchema, createFleetManagerSchema, assignManagerSchema } = require("../validators/user")
const {
    createDriverSchema,
    updateDriverStatusSchema,
    assignDriverToVehicleSchema,
    assignDriverToTeamSchema
} = require("../validators/driver")

router.use(verifyToken)

router.get("/me", me);
router.patch("/", updateProfileSchema, validate, updateProfile);

router.use(checkSubscription())

// create Fleet Manager
router.post("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    createFleetManagerSchema,
    validate,
    getTeam,
    createFleetManager
)

// List Managers
router.get("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    listFleetManagers
)

router.get("/managers/:id/stats",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    getManagerStats
)

// Assign Manager to a Team
router.patch("/fleet-manager/:id/assign-to-team",
    allowedTo(userRoles.ADMIN),
    assignManagerSchema,
    validate,
    getTeam,
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
    assignDriverToTeamSchema,
    validate,
    getTeam,
    driverController.setDriverToTeam
)

router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))
router.use(getTeam)

// Create Driver
router.post("/driver",
    createDriverSchema,
    validate,
    driverController.createDriver
)

// Get Drivers List
router.get("/driver", driverController.listDrivers)

// Get Single Driver Details
router.get("/driver/:id", driverController.getDriverById)

// Get Single Driver Operational Stats
router.get("/driver/:id/stats", driverController.getDriverStats)

// Remove Driver From Team
router.patch("/driver/:id/remove-from-team", driverController.removeDriverFromTeam)

// Assign Driver to a vehicle
router.patch("/driver/:id/assign-to-vehicle",
    assignDriverToVehicleSchema,
    validate,
    driverController.assignDriverToVehicle
)

// Remove Driver from a vehicle
router.patch("/driver/:id/remove-from-vehicle", driverController.unassignDriverFromVehicle)

// Delete Driver
router.delete("/driver/:id", driverController.deleteDriver)

// Update Status (Drivers & Managers)
router.patch("/:userId/status",
    updateDriverStatusSchema,
    validate,
    driverController.changeDriverStatus
)

module.exports = router