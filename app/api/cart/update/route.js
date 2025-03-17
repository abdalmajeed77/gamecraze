import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/utils/connectDB"; // Corrected import
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { cartItems } = await request.json(); // Corrected method to access request body

        // Validation for required fields
        if (!cartItems) {
            return NextResponse.json({ success: false, message: "All fields are required." });
        }

        await connectDB();
        const user = await User.findById(userId);

        user.cartItems = cartData;
        await user.save();
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
