import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import User from "@/models/User.js";
import { getAuth } from "@clerk/nextjs/server";

connectDB().catch((err) => console.error("Database connection error:", err));

export async function GET(request) {
  console.log("Cart GET request received");
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user.cartItems || {} });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}