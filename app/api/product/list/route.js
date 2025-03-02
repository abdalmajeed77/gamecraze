import ConnectDB from "@/config/db";
import Product from "@/models/Product";

import { NextResponse } from "next/server";

export async function GET(request) {
    const query = request.query || {}; // Ensure query is defined
    const { page = 1, limit = 10, sort = 'name', order = 'asc' } = query;


    try {
        await ConnectDB();
        const products = await Product.find({})
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments();
        return NextResponse.json({
            success: true,
            data: products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
