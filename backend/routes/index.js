const router = require("express").Router();

const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const companyRoutes = require("./company.route");
const teamRoutes = require("./team.route");
const taskRoutes = require("./task.route");
const vehicleRoutes = require("./vehicle.route");
const fuelRoutes = require("./fuel.route");
const maintenanceRoutes = require("./maintenance.route");
const alertRoutes = require("./alert.route");
const gpsRoutes = require("./gps.route");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/company", companyRoutes);
router.use("/team", teamRoutes);
router.use("/task", taskRoutes);
router.use("/vehicle", vehicleRoutes);
router.use("/fuel", fuelRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/alert", alertRoutes);
router.use("/gps", gpsRoutes);

module.exports = router;