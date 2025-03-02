import { getAuth } from "@clerk/nextjs/server";
import ConnectDB from "@/config/db";
import User from "@/models/User";  
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await ConnectDB();
        const { userId } = getAuth(request);
        console.log("Retrieving user with ID:", userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found for ID:", userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }
        return NextResponse.json({ success: true, data: user });
    }

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const newUser = new User(data);
        await newUser.save();
        return NextResponse.json({ success: true, data: newUser });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
