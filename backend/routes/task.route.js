const router = require("express").Router();
const { userRoles } = require("../data/roles");

const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const getTeam = require("../middlewares/getTeam");
const checkSubscription = require("../middlewares/CheckSubscription");
const validate = require("../middlewares/validator");

const {
  createTask,
  getTaskStats,
  listTask,
  listTasks,
  updateTask,
  acceptTask,
  finishTask,
  declineTask,
  listDriverTasks,
} = require("../controllers/task.controller");

const {
  createTaskSchema,
  updateTaskSchema,
  declineTaskSchema,
} = require("../validators/task");

router.use(verifyToken);
router.use(checkSubscription());

// Driver specific routes
router.patch("/:id/accept", allowedTo(userRoles.DRIVER), acceptTask);
router.patch("/:id/finish", allowedTo(userRoles.DRIVER, userRoles.FLEET_MANAGER, userRoles.ADMIN), finishTask);
router.get("/driver", allowedTo(userRoles.DRIVER), listDriverTasks);

router.use(getTeam);

// Fleet Manager & Admin routes
router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER));
router.post("/", createTaskSchema, validate, createTask);
router.get("/stats", getTaskStats);
router.get("/", listTasks);
router.get("/:id", listTask);
router.patch("/:id", updateTaskSchema, validate, updateTask);
router.patch("/:id/decline", declineTaskSchema, validate, declineTask);

module.exports = router;