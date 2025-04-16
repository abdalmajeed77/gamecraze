import { NextResponse } from "next/server";
import ConnectDB from "@/config/db.js";
import User from "@/models/User.js";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // Ensure database connection
    await ConnectDB();

    // Check for authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided in Authorization header");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "No token provided",
        },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        {
          success: false,
          error: "ServerError",
          message: "Internal server error",
        },
        { status: 500 }
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate token payload
    if (!decoded.userId) {
      console.log("Token payload missing userId");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid token payload",
        },
        { status: 401 }
      );
    }

    // Fetch user from database
    console.log("Fetching user data for ID:", decoded.userId);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return NextResponse.json(
        {
          success: false,
          error: "NotFound",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        cartItems: user.cartItems || {}, // Adjust to [] if schema defines an array
      },
    });
  } catch (error) {
    console.error("Error in /api/user/data:", error);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Token expired",
        },
        { status: 401 }
      );
    } else if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "ServerError",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}