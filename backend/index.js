require("dotenv").config();
const express = require("express");
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { connectDB } = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());

connectDB().then(() => {
    app.listen(3001, () => {
        console.log("Server Running at port: 3001")
    })
});

const userRoutes = require("./routes/user.route")

app.use("/api/users", userRoutes)