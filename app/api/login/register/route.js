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
  console.log("Register request received");
  try {
    await connectDB();
    const { email, password, name, phoneNumber } = await request.json();
    console.log("Request body:", { email, name, phoneNumber });

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const user = new User({
      email,
      name,
      password,
      phoneNumber: phoneNumber || "",
      isAdmin: false, // Explicitly set isAdmin to false
      tokens: [], // Initialize tokens array
      cartItems: [], // Initialize cartItems array
    });
    await user.save();

    return NextResponse.json(
      { success: true, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}