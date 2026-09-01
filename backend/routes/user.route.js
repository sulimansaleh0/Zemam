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
router.route("/fleet-manager/:id/assign-to-team")
    .patch(allowedTo(userRoles.ADMIN), assignManagerSchema, validate, assignManager)
    // .post(allowedTo(userRoles.ADMIN), assignManagerSchema, validate, assignManager)

// Delete Manager from a Team
router.route("/fleet-manager/:id/remove-from-team")
    .patch(allowedTo(userRoles.ADMIN), removeFleetManager)
    // .post(allowedTo(userRoles.ADMIN), removeFleetManager)

// delete Manager
router.delete(
    "/fleet-manager/:id",
    allowedTo(userRoles.ADMIN),
    deleteFleetManager
)

// Set Driver To Team
router.route("/driver/:id/assign-to-team")
    .patch(allowedTo(userRoles.ADMIN), getTeam, setDriverToTeam)
    // .post(allowedTo(userRoles.ADMIN), getTeam, setDriverToTeam)

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
router.route("/driver/:id/assign-to-vehicle")
    .patch(assignDriverToVehicle)
    // .post(assignDriverToVehicle)

// Remove Driver From Team
router.route("/driver/:id/remove-from-team").patch(removeDriverFromTeam)


// Remove Driver from a vehicle
router.route("/driver/:id/remove-from-vehicle")
    .patch(removeDriverFromVehicle)
    // .post(removeDriverFromVehicle)

// Delete Driver
router.delete("/driver/:id", deleteDriver)

// Update Status
router.patch("/:userId/status",
    updateUserStatusSchema,
    validate,
    changeUserStatus
)

module.exports = router