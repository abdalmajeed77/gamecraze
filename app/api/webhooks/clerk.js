import { NextResponse } from "next/server";
import { verifySignature } from "@clerk/nextjs/server";
import User from "../../models/User.js";
import ConnectDB from "../../config/db.js";

export async function POST(request) {
    await ConnectDB();

    const signature = request.headers.get("clerk-signature");
    const body = await request.json();

    console.log("Received webhook payload:", body); // Log the incoming payload
    console.log("Webhook signature:", signature); // Log the signature for debugging

    console.log("Webhook signature:", signature); // Log the signature for debugging

    // Verify the webhook signature

    if (!verifySignature(body, signature)) {
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    // Extract user data from the webhook payload
    const { userId, email, firstName, lastName } = body.data;

    // Combine firstName and lastName into a full name
    const name = `${firstName} ${lastName}`;


    // Create a new user instance
    const newUser = new User({
        _id: userId,
        email,
        name, // Use the combined name instead of firstName and lastName

    });

    try {
        await newUser.save();
        console.log("User added to database:", newUser); // Log the new user details
        console.log("Response sent: User added successfully"); // Log the response sent

        console.log("Response sent: User added successfully"); // Log the response sent

        return NextResponse.json({ success: true, message: "User added to database" });

    } catch (error) {
        console.error("Error saving user:", error.message); // Log the error message
        console.error("Failed to save user:", newUser); // Log the user details that failed to save

        console.error("Failed to save user:", newUser); // Log the user details that failed to save

        return NextResponse.json({ success: false, message: error.message });

    }
}
