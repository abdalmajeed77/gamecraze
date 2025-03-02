const connectDB = require("./utils/connectDB");
const User = require("./models/User.js");

(async () => {
    await connectDB();

    try {
        const newUser = new User({
            _id: "user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z",

            name: "John Doe",
            email: "johndoe@example.com",
            imageurl: "https://example.com/image.jpg",
            cartItems: [], // Empty cart initially
        });

        await newUser.save();
        console.log("User saved successfully in 'users' collection!");
    } catch (error) {
        console.error("Error saving user:", error);
    }
})();
