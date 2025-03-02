import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authSeller = async (userId) => {
    try {
        const user = await clerkClient.users.getUser(userId);
        console.log('User:', user); // Added logging

        if (user.publicMetadata.role === "seller") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error fetching user:', error); // Added logging
        return NextResponse.json({ success: false, message: error.message });
    }
}

export { authSeller };
