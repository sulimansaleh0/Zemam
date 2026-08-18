const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { verifyRecordSchema } = require("../validators/expenseRecord")

const { verifyFuelRecord, verifyMaintenanceRecord, listFuelRecords, listMaintenanceRecords } = require("../controllers/admin.controller")

router.use(verifyToken)
router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

router.get("/fuel", listFuelRecords)
router.get("/maintenance", listMaintenanceRecords)
router.post("/verify-fuel", verifyRecordSchema, validate, verifyFuelRecord)
router.post("/verify-maintenance", verifyRecordSchema, validate, verifyMaintenanceRecord)

module.exports = router