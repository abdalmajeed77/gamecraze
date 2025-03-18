import connectDB from '@/config/db.js'; // Updated import path
import Product from '@/models/Product.js'; // Updated to ES module import

const sampleProducts = [
    {
        name: "Apple Earphones",
        description: "Noise-cancellation, 40-hour battery",
        price: 299.99,
        priceOptions: [
            { price: 299.99, description: "Standard Price" },
            { price: 249.99, description: "Discounted Price" }
        ],
        imageUrl: "https://example.com/apple-earphones.jpg"
    },
    {
        name: "Samsung Galaxy S21",
        description: "Latest smartphone with amazing features",
        price: 799.99,
        priceOptions: [
            { price: 799.99, description: "Standard Price" },
            { price: 749.99, description: "Discounted Price" }
        ],
        imageUrl: "https://example.com/samsung-galaxy-s21.jpg"
    },
    {
        name: "Sony WH-1000XM4",
        description: "Industry-leading noise canceling headphones",
        price: 349.99,
        priceOptions: [
            { price: 349.99, description: "Standard Price" },
            { price: 299.99, description: "Discounted Price" }
        ],
        imageUrl: "https://example.com/sony-wh-1000xm4.jpg"
    }
];


const seedProducts = async () => {
    await connectDB();
    await Product.deleteMany({}); // Clear existing products
    console.log("Sample products added successfully.");

    await Product.insertMany(sampleProducts); // Insert sample products
    console.log("Sample products added successfully.");
};

seedProducts().catch(err => console.error("Error seeding products:", err));
