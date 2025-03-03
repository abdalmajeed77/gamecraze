const mongoose = require("mongoose");
const connectDB = require("../utils/connectDB");

const userSchema = new mongoose.Schema({   
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


module.exports = User;
