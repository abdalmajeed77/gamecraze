import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { ConnectDB } from "db/connect";
import { NextResponse } from ("next/server");


export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { cartItems } = await request.body.json();
        await ConnectDB();
        const user = await User.findById(userId);

        user.cartItems = cartItems;

        await user.save()
        NextResponse.json({ success: true, data: user });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
    
}
