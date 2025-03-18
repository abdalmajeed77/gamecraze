import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "gamecart" });
    console.log("MongoDB connected");
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await user.clearJwtToken();

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}