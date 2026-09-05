const router = require("express").Router()

// Middlewares
const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const getTeam = require("../middlewares/getTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")

// Controllers
const { createFuelRecord, listFuelRecords, verifyFuelRecord } = require("../controllers/fuel.controller")
const { userRoles } = require("../data/roles")

const imageFolder = "fuelRecords"

router.use(verifyToken)
router.use(checkSubscription())
router.use(getTeam)

router.post("/",
    allowedTo(userRoles.DRIVER),
    upload.array("image", 1),
    uploadToCloudinary(imageFolder),
    createFuelRecord
)

router.use(allowedTo(userRoles.FLEET_MANAGER))
router.get("/", listFuelRecords)
router.post("/:id", verifyFuelRecord)

module.exports = router