import mongoose from "mongoose";
import connectDB from "../utils/connectDB.js"; // Updated import to ES module syntax

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: false,
    },
    birthday: {
        type: Date,
        required: false,
    },
    verification: {
        status: {
            type: String,
            required: false,
        },
        strategy: {
            type: String,
            required: false,
        }
    },
    externalId: {
        type: String,
        required: false,
    },
    _id: {  
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    imageurl: {
        type: String,
        required: true,
    },
    cartItems: [{
        productId: { type: String, required: true },
        quantity: { type: Number, required: true }
    }],
}, {
    minimize: false,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

(async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

export default User; // Updated export to ES module syntax
