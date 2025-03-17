import mongoose from "mongoose"; // Updated to ES module import


const MONGO_URI = "mongodb+srv://abdhackiabd:abdalmajeed@cluster0.jk8s0.mongodb.net/gamecart?retryWrites=true&w=majority&appName=Cluster0"; // No change


const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        console.log("✅ Already connected to MongoDB");
        return;
    }

    await mongoose.connect(MONGO_URI).catch(error => {
        console.error("❌ Error connecting to MongoDB:", error); // Added error logging
    });


    console.log("✅ Connected to MongoDB");
};

export default connectDB; // Updated to ES module export
