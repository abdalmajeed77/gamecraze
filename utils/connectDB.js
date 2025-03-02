const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://abdhackiabd:abdalmajeed@cluster0.jk8s0.mongodb.net/gamecart?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        console.log("✅ Already connected to MongoDB");
        return;
    }

    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB");
};

module.exports = connectDB;
