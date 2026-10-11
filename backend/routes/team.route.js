const router = require("express").Router();
const { userRoles } = require("../data/roles");

const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const checkSubscription = require("../middlewares/CheckSubscription");
const getTeam = require("../middlewares/getTeam");
const validate = require("../middlewares/validator");

const {
  createTeam,
  listTeams,
  teamStatics,
  updateTeam,
  listTeam,
  deleteTeam,
  assignResources,
} = require("../controllers/team.controller");
const {
  createTeamSchema,
  updateTeamSchema,
  assignResourcesSchema,
} = require("../validators/team");

router.use(verifyToken);
router.use(checkSubscription());

// 1. Team overview statics
router.get(
  "/statics",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
  getTeam,
  teamStatics
);

// 2. Single team detail
router.get(
  "/:id",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER),
  getTeam,
  listTeam
);

// 3. Admin-only management endpoints
router.use(allowedTo(userRoles.ADMIN));

router.post("/", createTeamSchema, validate, createTeam);
router.get("/", listTeams);
router.patch("/:id", updateTeamSchema, validate, updateTeam);
router.patch("/:id/resources", getTeam, assignResourcesSchema, validate, assignResources);
router.delete("/:id", deleteTeam);

module.exports = router;