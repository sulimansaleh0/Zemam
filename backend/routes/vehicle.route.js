const router = require("express").Router()

const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const getTeam = require("../middlewares/getTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { createVehicleSchema, updateVehicleStatusSchema } = require("../validators/vehicle")

const { createVehicle, listVehicles, listVehicle, changeVehicleStatus, setVehicleToTeam, removerVehicleFromTeam } = require("../controllers/vehicle.controller")

router.use(verifyToken)
router.use(getTeam)

router.post("/:id/assign-to-team",
    allowedTo(userRoles.ADMIN),
    setVehicleToTeam
)

router.post("/:id/remove-from-team",
    allowedTo(userRoles.ADMIN),
    removerVehicleFromTeam
)

router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))
router.use(checkSubscription())

router.post("/", createVehicleSchema, validate, createVehicle)
router.get("/", listVehicles)
router.get("/:id", listVehicle)
router.patch("/:id/status", updateVehicleStatusSchema, validate, changeVehicleStatus)

module.exports = router