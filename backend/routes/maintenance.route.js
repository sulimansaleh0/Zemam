const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const verifyTeam = require("../middlewares/verifyTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")

const { createMaintenanceRecord, listMaintenanceRecords, verifyMaintenanceRecord } = require("../controllers/maintenance.controller")

const imageFolder = "maintenance"

router.use(verifyToken)
router.use(verifyTeam)
router.use(checkSubscription())


router.post("/",
    allowedTo(userRoles.FLEET_MANAGER, userRoles.DRIVER),
    upload.array("images", 4),
    uploadToCloudinary(imageFolder),
    createMaintenanceRecord
)

router.use(allowedTo(userRoles.FLEET_MANAGER))

router.get("/", listMaintenanceRecords)
router.post("/:id", verifyMaintenanceRecord)

module.exports = router