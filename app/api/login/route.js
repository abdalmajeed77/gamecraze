import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "gamecart" });
    console.log("MongoDB connected");
  }
}

export async function POST(request) {
  console.log("Login request received");
  try {
    await connectDB();
    const { email, password } = await request.json();
    console.log("Request body:", { email, password });

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: "Account is blocked" },
        { status: 403 }
      );
    }

    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Store the JWT in the user's document
    user.jwtToken = token;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Login successful", token, userId: user._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}