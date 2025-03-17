import axios from 'axios';


const testUserData = async () => {

    const userData = {
        id: "unique_user_id_12345", // Updated to a unique value


        name: "Test User",
        email: "testuser@example.com",
        imageurl: "http://example.com/image.jpg",
        cartItems: []
    };

    try {
        const response = await axios.post('http://localhost:3000/api/user/data', userData);
        console.log('Response:', response.data);
        // Validate the response
        if (JSON.stringify(response.data) === JSON.stringify(expectedResponse)) {
            console.log('Test passed: User data saved correctly.');
        } else {
            console.error('Test failed: User data does not match expected response.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testUserData();
