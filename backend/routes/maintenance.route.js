const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")
const validator = require("../middlewares/validator")

const { createMaintenanceSchema, verifyMaintenanceSchema } = require("../validators/maintenance")

const { createMaintenanceRecord, listMaintenanceRecords, verifyMaintenanceRecord, getMaintenanceStats } = require("../controllers/maintenance.controller")

const imageFolder = "maintenance"

router.use(verifyToken)
router.use(checkSubscription())

router.post("/",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
    upload.array("images", 4),
    uploadToCloudinary(imageFolder),
    createMaintenanceSchema,
    validator,
    createMaintenanceRecord
)

router.get("/",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
    listMaintenanceRecords
)

router.get("/stats",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    getMaintenanceStats
)

router.patch("/:id/verify",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    verifyMaintenanceSchema,
    validator,
    verifyMaintenanceRecord
)

module.exports = router