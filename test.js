const connectDB = require("./utils/connectDB");
const User = require("./models/User.js");

(async () => {
    await connectDB();

    try {
const existingUser = await User.findById("user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z");
if (!existingUser) {
    const newUser = new User({
        _id: "user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z",
        name: "John Doe",
        email: "johndoe@example.com",
        imageurl: "https://example.com/image.jpg",
        cartItems: [], // Empty cart initially
    });

    await newUser.save();
    console.log("User saved successfully in 'users' collection!");
} else {
    console.log("User already exists in 'users' collection!");

        _id: "user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z",


            name: "John Doe",
            email: "johndoe@example.com",
            imageurl: "https://example.com/image.jpg",
            cartItems: [], // Empty cart initially
        });

        await newUser.save();
    console.log("User already exists in 'users' collection!");
} else {
    await newUser.save();
    console.log("User saved successfully in 'users' collection!");

    } catch (error) {
        console.error("Error saving user:", error);
    }
})();
