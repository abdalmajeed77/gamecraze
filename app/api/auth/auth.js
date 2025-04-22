import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const token = cookies().get("token")?.value;
    console.log("GET /api/auth/verify: Token from cookies:", token ? token.substring(0, 20) + "..." : "No token");
    if (!token) {
      console.log("GET /api/auth/verify: No token provided");
      return NextResponse.json(
        { verified: false, message: "No token provided" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("GET /api/auth/verify: JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { verified: false, message: "Internal server error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("GET /api/auth/verify: Token decoded successfully:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    return NextResponse.json(
      {
        verified: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
      },
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
    console.error("GET /api/auth/verify: Token verification error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { verified: false, message: "Invalid token" },
        { status: 401 }
      );
    }
    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        { verified: false, message: "Token expired" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { verified: false, message: "Internal server error" },
      { status: 500 }
    );
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