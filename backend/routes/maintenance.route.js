const router = require("express").Router()

const verifyToken = require("../middlewares/verifyToken")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")
const { createMaintenanceRecord } = require("../controllers/maintenance.controller")

const imageFolder = "maintenance"

router.use(verifyToken)
router.use(checkSubscription())


router.post("/",
    upload.array("images", 4),
    uploadToCloudinary(imageFolder),
    createMaintenanceRecord
)

module.exports = router