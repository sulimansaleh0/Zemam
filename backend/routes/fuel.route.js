const router = require("express").Router();

// Middlewares
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const getTeam = require("../middlewares/getTeam");
const checkSubscription = require("../middlewares/CheckSubscription");
const upload = require("../middlewares/upload");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");
const validator = require("../middlewares/validator");
const { createFuelSchema, verifyFuelSchema, voidFuelSchema } = require("../validators/fuel");

// Controllers
const {
  createFuelRecord,
  listFuelRecords,
  getFuelStats,
  verifyFuelRecord,
  voidFuelRecord,
} = require("../controllers/fuel.controller");
const { userRoles } = require("../data/roles");

const imageFolder = "fuelRecords";

router.use(verifyToken);
router.use(checkSubscription());

// توثيق إيصال وقود جديد (متاح للمدير وللسائق)
router.post(
  "/",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
  upload.array("image", 1),
  uploadToCloudinary(imageFolder),
  createFuelSchema,
  validator,
  getTeam,
  createFuelRecord
);

// استعلام سجلات الوقود (متاح للأدمن ومدير الأسطول، ومتاح للسائق لعرض فواتيره الخاصة)
router.get(
  "/",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
  listFuelRecords
);

// المسارات المحصورة بمدراء الأساطيل وإدارة الشركة
router.use(allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER));
router.get("/stats", getFuelStats);
router.patch("/:id/verify", verifyFuelSchema, validator, verifyFuelRecord);
router.patch("/:id/void", voidFuelSchema, validator, voidFuelRecord);

module.exports = router;