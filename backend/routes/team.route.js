const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { createTeam, listTeams, teamStatics } = require("../controllers/team.controller")

router.use(verifyToken)
router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

router.post("/", createTeam)
router.get("/", listTeams)
router.get("/statics", teamStatics)
module.exports = router