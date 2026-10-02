const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getLiveFleet, getTripSummary, getVehicleHistory, getLiveTripPath, ingestBatchTelemetry } = require("../controllers/gps.controller");
const getTeam = require("../middlewares/getTeam");

router.use(verifyToken)
router.use(getTeam)

router.get("/live", getLiveFleet);
router.post("/telemetry/batch", ingestBatchTelemetry);

module.exports = router;
