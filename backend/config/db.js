const mongoose = require("mongoose");

const dns = require("node:dns");
// يوجّه سيرفر النود في هذا التيرمينال فقط لاستخدام DNS جوجل
dns.setServers(["8.8.8.8", "8.8.4.4"]);


exports.connectDB = async () => {
    await mongoose.connect(process.env.DB_URL);
}