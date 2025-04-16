  import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}

export async function GET(request) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  try {
    // Try getting token from both cookies and Authorization header
    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.split(' ')[1];
    const token = cookieToken || headerToken;
    
    if (!token) {
      console.log('No token found in request');
      return NextResponse.json(
        { verified: false, message: "No token provided" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { verified: false, message: "Internal server error" },
        { status: 500 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return NextResponse.json(
      { 
        verified: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Token verification error:", error.message);
    
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
