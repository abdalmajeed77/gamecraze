import { NextResponse } from "next/server";
import connectDB from "@/utils/connectDB";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await connectDB();
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "NotFound", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user.cartItems || {} });
  } catch (error) {
    console.error("Error in /api/cart/update GET:", error);
    return NextResponse.json(
      { success: false, error: "ServerError", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await connectDB();
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { cartData } = await req.json();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { cartItems: cartData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "NotFound", message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user.cartItems });
  } catch (error) {
    console.error("Error in /api/cart/update POST:", error);
    return NextResponse.json(
      { success: false, error: "ServerError", message: "Internal server error" },
      { status: 500 }
    );
  }
}