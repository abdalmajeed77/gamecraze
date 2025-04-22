import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Stripe from "stripe";
import { v2 as cloudinary } from "cloudinary";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    console.log("POST /api/order/create: Request received");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      console.log("POST /api/order/create: No token provided");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("POST /api/order/create: JWT_SECRET not set");
      return NextResponse.json({ success: false, message: "Server configuration error: JWT_SECRET missing" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("POST /api/order/create: Token decoded:", { userId: decoded.userId });

    await connectDB().catch((err) => {
      console.error("POST /api/order/create: MongoDB connection error:", err);
      throw new Error("Database connection failed");
    });

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("POST /api/order/create: User not found");
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const items = JSON.parse(formData.get("items"));
    const amount = parseFloat(formData.get("amount"));
    const paymentMethod = formData.get("paymentMethod");
    const contact = JSON.parse(formData.get("contact"));
    const transactionImage = formData.get("transactionImage");

    console.log("POST /api/order/create: Order data:", { items, amount, paymentMethod, contact });

    // Validate order data
    if (!items || items.length === 0) {
      console.log("POST /api/order/create: No items provided");
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      console.log("POST /api/order/create: Invalid amount");
      return NextResponse.json({ success: false, message: "Invalid order amount" }, { status: 400 });
    }
    if (!["Stripe", "PayPal", "UPI", "BankTransfer"].includes(paymentMethod)) {
      console.log("POST /api/order/create: Invalid payment method");
      return NextResponse.json({ success: false, message: "Invalid payment method" }, { status: 400 });
    }
    if (!contact || !contact.email) {
      console.log("POST /api/order/create: Email is required");
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }
    if (["UPI", "BankTransfer"].includes(paymentMethod) && !transactionImage) {
      console.log("POST /api/order/create: Transaction image required");
      return NextResponse.json({ success: false, message: "Transaction proof image is required" }, { status: 400 });
    }

    // Process payment
    let paymentStatus = "Pending";
    let transactionImageUrl = "";
    if (paymentMethod === "Stripe") {
      const stripeToken = formData.get("stripeToken");
      if (!stripeToken) {
        return NextResponse.json({ success: false, message: "Stripe token missing" }, { status: 400 });
      }
      try {
        const charge = await stripe.charges.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          source: stripeToken,
          description: `Recharge order for user ${decoded.userId}`,
        });
        console.log("POST /api/order/create: Stripe charge created:", charge.id);
        paymentStatus = charge.status === "succeeded" ? "Completed" : "Pending";
      } catch (err) {
        console.error("POST /api/order/create: Stripe error:", err);
        return NextResponse.json({ success: false, message: "Payment processing failed" }, { status: 400 });
      }
    } else if (paymentMethod === "PayPal") {
      const paypalOrderId = formData.get("paypalOrderId");
      if (!paypalOrderId) {
        return NextResponse.json({ success: false, message: "PayPal order ID missing" }, { status: 400 });
      }
      paymentStatus = "Completed";
    } else if (["UPI", "BankTransfer"].includes(paymentMethod)) {
      try {
        // Get buffer from transactionImage before starting upload
        const buffer = Buffer.from(await transactionImage.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "gamecart/transactions" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
        transactionImageUrl = uploadResult.secure_url;
        console.log("POST /api/order/create: Transaction image uploaded:", transactionImageUrl);
      } catch (err) {
        console.error("POST /api/order/create: Image upload error:", err);
        return NextResponse.json({ success: false, message: "Failed to upload transaction image" }, { status: 500 });
      }
    }

    // Create order
    const order = new Order({
      user: decoded.userId,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        emailOrId: item.emailOrId,
        selectedPrice: item.selectedPrice,
      })),
      amount,
      paymentMethod,
      paymentStatus,
      contact,
      transactionImage: transactionImageUrl,
    });

    await order.save();
    console.log("POST /api/order/create: Order created:", order._id);

    // Clear user's cart
    user.cartItems = {};
    await user.save();
    console.log("POST /api/order/create: User cart cleared:", decoded.userId);

    return NextResponse.json(
      { success: true, message: "Order placed successfully", orderId: order._id },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("POST /api/order/create: Error:", {
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}