import axios from 'axios';


const testWebhook = async () => {
const webhookPayload = {
    // Updated to use the ngrok URL for testing
    url: 'https://ea46-49-156-84-155.ngrok-free.app/api/webhooks',

        data: {
            id: 'user_test_id',
            firstName: 'Test',
            lastName: 'User',

            email: 'testuser@example.com',
            imageurl: 'http://example.com/image.jpg'
        },
        type: 'user.created'
    };

    try {
        const response = await axios.post('http://localhost:3000/api/webhooks', webhookPayload);
        console.log('Webhook Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testWebhook();
