import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

export async function connectDB() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { dbName: "gamecart" });
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw new Error("Failed to connect to the database");
    }
  }
}

export async function GET(request) {
  try {
    await connectDB();

    // Fetch all users (no token verification)
    const users = await User.find().select("-password");
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const { userId: targetUserId, action, value } = await request.json();
    if (!targetUserId || !action) {
      return NextResponse.json(
        { success: false, message: "User ID and action are required" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "changePassword":
        if (!value) {
          return NextResponse.json(
            { success: false, message: "New password is required" },
            { status: 400 }
          );
        }
        targetUser.password = value; // Password will be hashed by schema
        break;
      case "block":
        targetUser.isBlocked = value === "true";
        break;
      case "updatePhone":
        targetUser.phoneNumber = value || "";
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    await targetUser.save();
    return NextResponse.json(
      { success: true, message: `User ${action} updated successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { userId: targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await User.findByIdAndDelete(targetUserId);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}