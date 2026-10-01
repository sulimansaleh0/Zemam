const router = require("express").Router()
const verifyToken = require("../middlewares/verifyToken")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const { listAlerts, markAlertRead } = require("../controllers/alert.controller")

router.use(verifyToken, checkSubscription(), getTeam)
router.get("/", listAlerts)
router.patch("/:id/read", markAlertRead)

module.exports = router
