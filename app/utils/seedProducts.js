const ConnectDB = require('@/config/db');
const Product = require('@/models/Product');

const sampleProducts = [
    {
        name: "Apple Earphones",
        description: "Noise-cancellation, 40-hour battery",
        price: 299.99,
        imageUrl: "https://example.com/apple-earphones.jpg"
    },
    {
        name: "Samsung Galaxy S21",
        description: "Latest smartphone with amazing features",
        price: 799.99,
        imageUrl: "https://example.com/samsung-galaxy-s21.jpg"
    },
    {
        name: "Sony WH-1000XM4",
        description: "Industry-leading noise canceling headphones",
        price: 349.99,
        imageUrl: "https://example.com/sony-wh-1000xm4.jpg"
    }
];

const seedProducts = async () => {
    await ConnectDB();
    await Product.deleteMany({}); // Clear existing products
    await Product.insertMany(sampleProducts); // Insert sample products
    console.log("Sample products added successfully.");
};

seedProducts().catch(err => console.error(err));
