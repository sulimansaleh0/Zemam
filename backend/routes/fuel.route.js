const router = require("express").Router()

// Middlewares
const verifyToken = require("../middlewares/verifyToken")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")

// Controllers
const { createFuelRecord } = require("../controllers/fuel.controller")

const imageFolder = "fuelRecords"
router.use(verifyToken)
router.use(checkSubscription())

router.post("/",
    upload.array("image", 1),
    uploadToCloudinary(imageFolder),
    createFuelRecord
)

module.exports = router