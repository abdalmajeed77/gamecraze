import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(request) {
  try {
    console.log("GET /api/order/list: Request received");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.log("GET /api/order/list: No token provided");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("GET /api/order/list: JWT_SECRET not set");
      return NextResponse.json({ success: false, message: "Server configuration error: JWT_SECRET missing" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("GET /api/order/list: Token decoded:", { userId: decoded.userId });

    await connectDB().catch((err) => {
      console.error("GET /api/order/list: MongoDB connection error:", err);
      throw new Error("Database connection failed");
    });

    const user = await User.findById(decoded.userId);
    if (!user || !user.isSeller) {
      console.log("GET /api/order/list: Not a seller");
      return NextResponse.json({ success: false, message: "Access denied: Seller account required" }, { status: 403 });
    }

    const orders = await Order.find()
      .populate("user", "email")
      .populate("items.product", "name")
      .lean();
    console.log("GET /api/order/list: Orders fetched:", orders.length);

    return NextResponse.json(
      { success: true, orders },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/order/list: Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
    if (error.name === "TokenExpiredError") {
      return NextResponse.json({ success: false, message: "Token expired" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}