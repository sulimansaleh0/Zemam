const mongoose = require("mongoose");
const TaskLivePoint = require("../models/taskLivePoint.model");

async function removeLegacyTaskPointTtlIndex() {
    let indexes;
    try {
        indexes = await TaskLivePoint.collection.indexes();
    } catch (err) {
        if (err.code === 26) return;
        throw err;
    }

    const ttlIndex = indexes.find((index) =>
        index.key?.createdAt === 1 && index.expireAfterSeconds !== undefined
    );
    if (ttlIndex) {
        await TaskLivePoint.collection.dropIndex(ttlIndex.name);
        console.log("Removed legacy TTL index from task GPS points");
    }
}

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        await removeLegacyTaskPointTtlIndex();
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        throw err;
    }
}