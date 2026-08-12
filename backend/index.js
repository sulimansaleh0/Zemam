require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser")
const { connectDB } = require("./config/db");

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB().then(() => {
    app.listen(3000, () => {
        console.log("Server Running at port: 3000")
    })
});

const userRoutes = require("./routes/user.route")

app.use("/api/users", userRoutes)