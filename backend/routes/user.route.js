const router = require("express").Router()
const { userRoles } = require("../data/roles")

const {
    me,
    updateProfile,
} = require("../controllers/user.controller")
const managerController = require("../controllers/manager.controller")
const driverController = require("../controllers/driver.controller")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { updateProfileSchema } = require("../validators/user")
const {
    createFleetManagerSchema,
    assignManagerSchema,
    updateManagerStatusSchema
} = require("../validators/manager")
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
    managerController.createFleetManager
)

// List Managers
router.get("/fleet-manager",
    allowedTo(userRoles.ADMIN),
    managerController.listFleetManagers
)

// Get Manager By ID
router.get("/fleet-manager/:id",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    managerController.getFleetManagerById
)

router.get("/managers/:id/stats",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    managerController.getManagerStats
)
router.get("/fleet-manager/:id/stats",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    managerController.getManagerStats
)

// Assign Manager to a Team
router.patch("/fleet-manager/:id/assign-to-team",
    allowedTo(userRoles.ADMIN),
    assignManagerSchema,
    validate,
    getTeam,
    managerController.assignManager
)

// Delete Manager from a Team
router.patch("/fleet-manager/:id/remove-from-team",
    allowedTo(userRoles.ADMIN),
    managerController.removeFleetManager
)

// Change Manager Status (Active / Inactive)
router.patch("/fleet-manager/:id/status",
    allowedTo(userRoles.ADMIN),
    updateManagerStatusSchema,
    validate,
    managerController.changeManagerStatus
)

// delete Manager
router.delete(
    "/fleet-manager/:id",
    allowedTo(userRoles.ADMIN),
    managerController.deleteFleetManager
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