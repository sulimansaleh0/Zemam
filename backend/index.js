require("dotenv").config();
const express = require("express");
const http = require("http");
const { initSocket } = require("./services/socket.service");
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { connectDB } = require("./config/db");
const { allowedOrigins } = require("./data");
const routes = require("./routes");
const PORT = process.env.PORT || 3001;

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(cookieParser());
app.use("/api", routes);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ status: "fail", msg: `المسار المطلوب ${req.originalUrl} غير موجود` });
});

// Centralized error handling middleware
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server Running at port: ${PORT}`);
    });
});
