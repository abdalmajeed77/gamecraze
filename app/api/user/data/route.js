import { getAuth } from "@clerk/nextjs/server.js";

import { NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import User from "@/models/User";

/**
 * POST handler - Creates or updates a user in MongoDB based on Clerk data
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with user data or error message
 */
export async function POST(request) {
    try {
        // Get request body
        const data = await request.json();
        
        // Basic input validation for required Clerk fields
        const requiredFields = ['id', 'first_name', 'last_name', 'email_addresses', 'image_url'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { success: false, message: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        await ConnectDB();
        
        // Extract email from email_addresses array
        const email = data.email_addresses && data.email_addresses[0] ? data.email_addresses[0].email_address : null;
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email address is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        let user = await User.findById(data.id);
        if (user) {
            // Update existing user
            user.firstName = data.first_name || user.firstName;
            user.lastName = data.last_name || user.lastName;
            user.name = `${data.first_name || user.firstName} ${data.last_name || user.lastName}`.trim() || user.name;
            user.email = email;
            user.imageurl = data.image_url || user.imageurl;
            await user.save();
            console.log(`User ${data.id} updated in MongoDB`);
            return NextResponse.json(
                { success: true, data: user },
                { status: 200 }
            );
        } else {
            // Create new user document
            const newUserData = {
                _id: data.id,
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown',
                email: email,
                imageurl: data.image_url || null,
            };
            const newUser = new User(newUserData);
            await newUser.save();
            console.log(`User ${data.id} created in MongoDB`);
            return NextResponse.json(
                { success: true, data: newUser },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error("POST error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
