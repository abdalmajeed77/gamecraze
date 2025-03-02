import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        console.log("✅ Already connected to MongoDB");
        return;
    }

        if (!process.env.MONGODB_URI) {

        throw new Error("❌ MONGO_URI is missing!");
    }

    console.log("MongoDB URI:", process.env.MONGODB_URI); // Log the MongoDB URI for debugging
    try {
        await mongoose.connect(process.env.MONGODB_URI); // Removed deprecated options


        console.log("✅ MongoDB Connected to gamecart database");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

export default connectDB;
