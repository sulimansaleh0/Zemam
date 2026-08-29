const router = require("express").Router()

const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const verifyTeam = require("../middlewares/verifyTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { createVehicleSchema, updateVehicleStatusSchema } = require("../validators/vehicle")

const { createVehicle, listVehicles, listVehicle, changeVehicleStatus } = require("../controllers/vehicle.controller")

router.use(verifyToken)
router.use(checkSubscription())

router.get("/", listVehicles)
router.get("/:id", listVehicle)

router.use(allowedTo(userRoles.FLEET_MANAGER, userRoles.ADMIN))
router.use(verifyTeam)

router.post("/", createVehicleSchema, validate, createVehicle)
router.patch("/:id/status", updateVehicleStatusSchema, validate, changeVehicleStatus)

module.exports = router