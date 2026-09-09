const router = require("express").Router()

// Middlewares
const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const getTeam = require("../middlewares/getTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")
const validator = require("../middlewares/validator")
const { createFuelSchema, verifyFuelSchema } = require("../validators/fuel")

// Controllers
const { createFuelRecord, listFuelRecords, getFuelStats, verifyFuelRecord } = require("../controllers/fuel.controller")
const { userRoles } = require("../data/roles")

const imageFolder = "fuelRecords"

router.use(verifyToken)
router.use(checkSubscription())
router.use(getTeam)

router.post("/",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
    upload.array("image", 1),
    uploadToCloudinary(imageFolder),
    createFuelSchema,
    validator,
    createFuelRecord
)

router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))
router.get("/stats", getFuelStats)
router.get("/", listFuelRecords)
router.patch("/:id/verify", verifyFuelSchema, validator, verifyFuelRecord)

module.exports = router