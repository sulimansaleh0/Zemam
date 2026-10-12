const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const checkSubscription = require("../middlewares/CheckSubscription");
const {
    getLiveFleet,
    ingestBatchTelemetry,
    getLiveTripPath,
    getTripSummary,
    getVehicleHistory
} = require("../controllers/gps.controller");
const allowedTo = require("../middlewares/allowedTo");
const { userRoles } = require("../data/roles");
const getTeam = require("../middlewares/getTeam");

router.use(verifyToken);
router.use(checkSubscription());
router.use(getTeam);

router.get("/live", allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER), getLiveFleet);
router.post("/telemetry/batch", allowedTo(userRoles.DRIVER), ingestBatchTelemetry);
router.get("/trip-path/:taskId", allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER), getLiveTripPath);
router.get("/trip-summary/:taskId", allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER, userRoles.DRIVER), getTripSummary);
router.get("/history/:vehicleId", allowedTo(userRoles.ADMIN, userRoles.FLEET_MANAGER), getVehicleHistory);

module.exports = router;
