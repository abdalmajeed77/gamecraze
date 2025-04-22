import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PaymentSettings from "@/models/PaymentSettings";

export async function GET() {
  try {
    console.log("GET /api/payment-settings: Request received");
    await connectDB().catch((err) => {
      console.error("GET /api/payment-settings: MongoDB connection error:", err);
      throw new Error("Database connection failed");
    });

    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({});
      console.log("GET /api/payment-settings: Created default settings");
    }

    console.log("GET /api/payment-settings: Settings fetched:", settings);
    return NextResponse.json(
      { success: true, paymentSettings: settings },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/payment-settings: Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return NextResponse.json({ success: false, message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("POST /api/payment-settings: Request received");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.log("POST /api/payment-settings: No token provided");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("POST /api/payment-settings: JWT_SECRET not set");
      return NextResponse.json({ success: false, message: "Server configuration error: JWT_SECRET missing" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("POST /api/payment-settings: Token decoded:", { userId: decoded.userId });

    await connectDB().catch((err) => {
      console.error("POST /api/payment-settings: MongoDB connection error:", err);
      throw new Error("Database connection failed");
    });

    const user = await User.findById(decoded.userId);
    if (!user || !user.isSeller) {
      console.log("POST /api/payment-settings: Not a seller");
      return NextResponse.json({ success: false, message: "Access denied: Seller account required" }, { status: 403 });
    }

    const { paymentMethods, customMethods } = await request.json();
    console.log("POST /api/payment-settings: Updating settings:", { paymentMethods, customMethods });

    if (!paymentMethods || typeof paymentMethods !== "object") {
      console.log("POST /api/payment-settings: Invalid payment methods");
      return NextResponse.json({ success: false, message: "Invalid payment methods" }, { status: 400 });
    }

    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings();
    }

    settings.paymentMethods = {
      Stripe: !!paymentMethods.Stripe,
      PayPal: !!paymentMethods.PayPal,
      UPI: !!paymentMethods.UPI,
      BankTransfer: !!paymentMethods.BankTransfer,
      Crypto: !!paymentMethods.Crypto,
    };

    if (customMethods) {
      settings.customMethods = customMethods.map((method) => ({
        type: method.type,
        details: {
          upiId: method.details.upiId || "",
          bankName: method.details.bankName || "",
          accountNumber: method.details.accountNumber || "",
          ifscCode: method.details.ifscCode || "",
        },
        isActive: !!method.isActive,
      }));
    }

    settings.updatedAt = new Date();
    await settings.save();

    console.log("POST /api/payment-settings: Settings updated:", settings);
    return NextResponse.json(
      { success: true, message: "Payment settings updated", paymentSettings: settings },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("POST /api/payment-settings: Error:", {
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}