const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { createTask, listTask, listTasks, updateTask, acceptTask, finishTask, declineTask } = require("../controllers/task.controller")

const { createTaskSchema } = require("../validators/task")

router.use(verifyToken)
router.use(checkSubscription())

// driver routes
router.patch("/:id/accept", allowedTo(userRoles.DRIVER), acceptTask)
router.patch("/:id/finish", allowedTo(userRoles.DRIVER), finishTask)

// fleet manager routes
router.use(allowedTo(userRoles.FLEET_MANAGER))
router.post("/", createTaskSchema, validate, createTask)
router.get("/", listTasks)
router.get("/:id", listTask)
router.patch("/:id", updateTask)
router.patch("/:id/decline", declineTask)

module.exports = router