import axios from 'axios';


export const sendWebhook = async (webhookPayload) => {

    const response = await axios.post('http://localhost:3000/api/webhooks', webhookPayload);
    return response.data;
};

export const testWebhookNew = async () => {

    const webhookPayload = {
        data: {
            id: 'user_test_id',
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            imageurl: 'https://example.com/image.jpg',
            gender: 'Non-binary',
            birthday: '1990-01-01',
            verification: {
                status: 'verified',
                strategy: 'ticket',
            },
        },
        type: 'user.created',
    };

    // Simulate sending the webhook payload
    const response = await sendWebhook(webhookPayload);
    console.log("Response from webhook:", response);
};

if (import.meta.url === "file://" + process.argv[1]) {
    testWebhookNew();
}
