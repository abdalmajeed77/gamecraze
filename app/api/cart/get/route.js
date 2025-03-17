import ConnectDB from "config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    console.log("Cart GET request received"); // Log when a cart GET request is made

    try {
        const { userId } = getAuth(request);
        await ConnectDB();
        const user = await User.findById(userId);
        const cartItems = user;
        return NextResponse.json({ success: true, data: cartItems });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
