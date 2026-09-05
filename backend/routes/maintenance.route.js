const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const getTeam = require("../middlewares/getTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")
const validator = require("../middlewares/validator")
const { createMaintenanceSchema, verifyMaintenanceSchema } = require("../validators/maintenance")

const { createMaintenanceRecord, listMaintenanceRecords, verifyMaintenanceRecord, getMaintenanceStats } = require("../controllers/maintenance.controller")

const imageFolder = "maintenance"

router.use(verifyToken)
router.use(checkSubscription())
router.use(getTeam)

router.post("/",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
    upload.array("images", 4),
    uploadToCloudinary(imageFolder),
    createMaintenanceSchema,
    validator,
    createMaintenanceRecord
)

router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))

router.get("/", listMaintenanceRecords)
router.get("/stats", getMaintenanceStats)
router.patch("/:id/verify", verifyMaintenanceSchema, validator, verifyMaintenanceRecord)

module.exports = router