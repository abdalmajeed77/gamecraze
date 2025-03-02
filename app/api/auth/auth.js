import connectDB from "@/utils/connectDB";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
    await connectDB();

    const { userId, email, firstName, lastName, imageUrl } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        let user = await User.findOne({ _id: userId });

        if (!user) {
            console.log("Creating user:", { _id: userId, email, firstName, lastName, imageurl: imageUrl });
            const name = `${firstName} ${lastName}`;
            user = await User.create({ _id: userId, email, name, imageurl: imageUrl, cartItems: {} });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
