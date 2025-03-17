import { POST } from './app/api/user/data/route.js';

async function testLogin() {
    const mockRequest = {
        json: async () => ({
            id: "test_user_id",
            first_name: "Test",
            last_name: "User",
            email_addresses: [{ email_address: "testuser@example.com" }],
            image_url: "http://example.com/image.jpg"
        })
    };

    const response = await POST(mockRequest);
    console.log("Response from login test:", response);
}

testLogin();
