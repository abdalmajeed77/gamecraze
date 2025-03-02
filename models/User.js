const mongoose = require("mongoose");
const connectDB = require("../utils/connectDB");
import { Schema, model, models  } from "mongoose";

const userSchema = new Schema({   
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
    cartItems: {
        type: Object,
        required: true,
    },
}, {
    minimize: false,
});

const User = models?.User || model("User", userSchema);

(async () => {
    await connectDB();
})();

module.exports = User;
