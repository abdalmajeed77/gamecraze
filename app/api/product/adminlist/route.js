import connectDB from "../../../utils/connectDB";
import Product from "../../../models/Product";

export default async function handler(req, res) {
    await connectDB();

    const { page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;

    try {
        const products = await Product.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments();
        return res.status(200).json({
            success: true,
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
