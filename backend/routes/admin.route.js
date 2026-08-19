const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { createTeam, createFleetManager, listTeams } = require("../controllers/team.controller")
const { createFleetManagerSchema } = require("../validators/user")

router.use(verifyToken)
router.use(allowedTo(userRoles.ADMIN))
router.use(checkSubscription())

router.post("/teams", createTeam)
router.get("/teams", listTeams)
router.post("/create-fleet-manager", createFleetManagerSchema, validate, createFleetManager)

module.exports = router