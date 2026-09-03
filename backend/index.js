require("dotenv").config();
const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { connectDB } = require("./config/db");

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app")
        ) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server Running at port: ${PORT}`);
    });
});

const authRoutes = require("./routes/auth.route")
const userRoutes = require("./routes/user.route")
const companyRoutes = require("./routes/company.route")
const fuelRoutes = require("./routes/fuel.route")
const maintenanceRoutes = require("./routes/maintenance.route")
const vehicleRoutes = require("./routes/vehicle.route")
const teamRoutes = require("./routes/team.route")
const taskRoutes = require("./routes/task.route")

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/company", companyRoutes)
app.use("/api/team", teamRoutes)
app.use("/api/task", taskRoutes)
app.use("/api/vehicle", vehicleRoutes)
app.use("/api/fuel", fuelRoutes)
app.use("/api/maintenance", maintenanceRoutes)