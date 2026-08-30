const mongoose = require("mongoose");
const dns = require("dns");

// حل مشكلة querySrv ECONNREFUSED بتحديد خوادم DNS عامة (Google & Cloudflare)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        throw err;
    }
}