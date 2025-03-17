import connectDB from "@/utils/connectDB";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export  async function GET(request) {
    await connectDB();

    try {
        await connectDB();
        const products = await Product.find({});
        return NextResponse.json({ success: true,  products });
   
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" });
    
 }
}