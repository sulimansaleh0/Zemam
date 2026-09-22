const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const {getLiveFleet, getTripSummary, getVehicleHistory} = require("../controllers/gps.controller");
const getTeam = require("../middlewares/getTeam");

router.use(verifyToken)
router.use(getTeam)

router.get("/live",  getLiveFleet);
router.get("/trip-summary/:taskId", getTripSummary);
router.get("/history/:vehicleId", getVehicleHistory);

module.exports = router;
