const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const getTeam = require("../middlewares/getTeam")
const validate = require("../middlewares/validator")

const { createTeam, listTeams, teamStatics, updateTeam } = require("../controllers/team.controller")
const { createTeamSchema } = require("../validators/team")

router.use(verifyToken)
router.use(checkSubscription())

router.get("/statics",
    allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
    getTeam,
    teamStatics
)

router.use(allowedTo(userRoles.ADMIN))

router.post("/", createTeamSchema, validate, createTeam)
router.get("/", listTeams)
router.patch("/:id", updateTeam)

module.exports = router