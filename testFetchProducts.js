import connectDB from "@/utils/connectDB"; // Corrected path
import Product from "@/models/Product";

const fetchProducts = async () => {
    await connectDB();
    try {
        const products = await Product.find({});
        console.log("Fetched Products:", products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

fetchProducts();
