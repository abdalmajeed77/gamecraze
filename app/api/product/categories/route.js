import { NextResponse } from "next/server";
import ConnectDB from "@/config/db.js";
import Product from "@/models/Product.js";

export async function GET(request) {
  await ConnectDB();

  try {
    // Fetch all unique categories from the Product collection
    const categories = await Product.distinct("category");
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}