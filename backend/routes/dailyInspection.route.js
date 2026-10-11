const router = require("express").Router();
const { userRoles } = require("../data/roles");
const verifyToken = require("../middlewares/verifyToken");
const allowedTo = require("../middlewares/allowedTo");
const checkSubscription = require("../middlewares/CheckSubscription");
const validator = require("../middlewares/validator");

const {
  createDailyInspectionSchema,
  getVehicleInspectionSchema,
} = require("../validators/dailyInspection");

const {
  createInspection,
  listInspections,
  getLatestInspectionForVehicle,
} = require("../controllers/dailyInspection.controller");

router.use(verifyToken);
router.use(checkSubscription());

router.post(
  "/",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
  createDailyInspectionSchema,
  validator,
  createInspection
);

router.get(
  "/",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
  listInspections
);

router.get(
  "/vehicle/:vehicleId/latest",
  allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER),
  getVehicleInspectionSchema,
  validator,
  getLatestInspectionForVehicle
);

module.exports = router;
