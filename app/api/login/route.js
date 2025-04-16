import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User.js";
import connectDB from "@/utils/connectDB";

export async function POST(request) {
  console.log("Login request received");
  try {
    await connectDB();
    const { email, password } = await request.json();
    console.log("Request body:", { email, password });

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: "Account is blocked" },
        { status: 403 }
      );
    }

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Optional: Store token in user document (uncomment if needed)
    // user.jwtToken = token;
    // await user.save();

    // Successful login response
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        userId: user._id,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Specific error handling
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, message: "Invalid token configuration" },
        { status: 500 }
      );
    }
    if (error.name === "MongoError") {
      return NextResponse.json(
        { success: false, message: "Database error. Please try again later." },
        { status: 500 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { success: false, message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}