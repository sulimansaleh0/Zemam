const router = require("express").Router()

const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/checkSubscription")
const validate = require("../middlewares/validator")

const { createVehicleSchema, updateVehicleStatusSchema, assignDriverSchema } = require("../validators/vehicle")

const { createVehicle, listVehicles, listVehicle, changeVehicleStatus, assignDriver } = require("../controllers/vehicle.controller")

router.use(verifyToken)
router.use(allowedTo(userRoles.FLEET_MANAGER))
router.use(checkSubscription())

router.post("/", createVehicleSchema, validate, createVehicle)
router.get("/", listVehicles)
router.get("/:id", listVehicle)
router.patch("/:id/status", updateVehicleStatusSchema, validate, changeVehicleStatus)
router.patch("/:id/assign-driver", assignDriverSchema, validate, assignDriver)

module.exports = router