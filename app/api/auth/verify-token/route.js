import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }
}