const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")

const { companyStatics } = require("../controllers/company.controller")

router.use(verifyToken)
router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

router.get("/statics", companyStatics)

module.exports = router