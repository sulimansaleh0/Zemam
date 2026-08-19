require("dotenv").config();
const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { connectDB } = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000", "https://bonnet-untrimmed-rants.ngrok-free.dev/"],
    credentials: true
}));
app.use(cookieParser());

connectDB().then(() => {
    app.listen(3001, () => {
        console.log("Server Running at port: 3001")
    })
});

const authRoutes = require("./routes/auth.route")
const userRoutes = require("./routes/user.route")
const companyRoutes = require("./routes/company.route")
const fuelRoutes = require("./routes/fuel.route")
const maintenanceRoutes = require("./routes/maintenance.route")
const vehicleRoutes = require("./routes/vehicle.route")
const teamRoutes = require("./routes/team.route")
const taskRoutes = require("./routes/task.route")
const driverRoutes = require("./routes/driver.route")

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/company", companyRoutes)
app.use("/api/team", teamRoutes)
app.use("/api/task", taskRoutes)
app.use("/api/vehicle", vehicleRoutes)
app.use("/api/driver", driverRoutes)
app.use("/api/fuel", fuelRoutes)
app.use("/api/maintenance", maintenanceRoutes)