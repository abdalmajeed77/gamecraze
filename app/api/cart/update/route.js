import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    console.log("POST /api/cart/update: Request received");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.log("POST /api/cart/update: No token provided");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("POST /api/cart/update: JWT_SECRET not set");
      return NextResponse.json({ success: false, message: "Server configuration error: JWT_SECRET missing" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("POST /api/cart/update: Token decoded:", { userId: decoded.userId });

    await connectDB().catch((err) => {
      console.error("POST /api/cart/update: MongoDB connection error:", err);
      throw new Error("Database connection failed");
    });

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("POST /api/cart/update: User not found");
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { cartData } = await request.json();
    console.log("POST /api/cart/update: Received cartData:", cartData);

    // Update user's cartItems as an Object
    user.cartItems = cartData || {};
    await user.save();
    console.log("POST /api/cart/update: Cart updated for user:", decoded.userId);

    return NextResponse.json(
      { success: true, data: user.cartItems },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("POST /api/cart/update: Error:", {
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

export async function GET(request) {
  try {
    console.log("GET /api/cart/update: Request received");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.log("GET /api/cart/update: No token provided");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("GET /api/cart/update: JWT_SECRET not set");
      return NextResponse.json({ success: false, message: "Server configuration error: JWT_SECRET missing" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("GET /api/cart/update: Token decoded:", { userId: decoded.userId });

    await connectDB().catch((err) => {
      console.error("GET /api/cart/update: MongoDB connection error:", err);
      throw new Error("Database connection failed");
    });

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("GET /api/cart/update: User not found");
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    console.log("GET /api/cart/update: Returning cart data");
    return NextResponse.json(
      { success: true, data: user.cartItems || {} },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/cart/update: Error:", {
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
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}