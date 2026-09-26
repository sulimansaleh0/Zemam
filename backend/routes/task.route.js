const router = require("express").Router()
const { userRoles } = require("../data/roles")

const verifyToken = require("../middlewares/verifyToken")
const allowedTo = require("../middlewares/allowedTo")
const getTeam = require("../middlewares/getTeam")
const checkSubscription = require("../middlewares/CheckSubscription")
const validate = require("../middlewares/validator")
const upload = require("../middlewares/upload")
const uploadToCloudinary = require("../middlewares/uploadToCloudinary")

const { createTask, listTask, listTasks, updateTask, acceptTask, finishTask, declineTask, listDriverTasks } = require("../controllers/task.controller")

const { createTaskSchema, finishTaskSchema } = require("../validators/task")

router.use(verifyToken)
router.use(checkSubscription())

// driver routes
router.patch("/:id/accept", allowedTo(userRoles.DRIVER), acceptTask)
router.patch(
    "/:id/finish",
    allowedTo(userRoles.DRIVER),
    upload.array("proofPhoto", 1),
    uploadToCloudinary("deliveryProof"),
    finishTaskSchema,
    validate,
    finishTask
)
router.get("/driver", allowedTo(userRoles.DRIVER), listDriverTasks)

router.use(getTeam)

// fleet manager routes
router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER))
router.post("/", createTaskSchema, validate, createTask)
router.get("/", listTasks)
router.get("/:id", listTask)
router.patch("/:id", updateTask)
router.patch("/:id/decline", declineTask)

module.exports = router