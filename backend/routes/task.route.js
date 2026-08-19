const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")

const { createTask, listTask, listTasks } = require("../controllers/task.controller")

const { createTaskSchema } = require("../validators/task")

router.use(verifyToken)
router.use(allowedTo(userRoles.FLEET_MANAGER))
router.use(checkSubscription())

router.post("/", createTaskSchema, validate, createTask)
router.get("/", listTasks)
router.get("/:id", listTask)

module.exports = router