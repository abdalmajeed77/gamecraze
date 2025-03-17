import { NextResponse } from "next/server";
import ConnectDB from '@/utils/connectDB'; // Your DB connection utility
import Product from '@/models/Product'; // Your Product model

export async function GET(req) {
  await ConnectDB();

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
  }

  console.log("Fetching product with ID:", productId); // Debugging line
  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  // Return priceOptions from the product document
  console.log("Price options found:", product.priceOptions); // Debugging line
  return NextResponse.json({
    success: true,
    priceOptions: product.priceOptions || [],
  });
}
