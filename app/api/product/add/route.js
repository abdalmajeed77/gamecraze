import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import ConnectDB from '@/config/db';
import Product from '@/models/Product';
import { Buffer } from 'buffer';
import jwt from 'jsonwebtoken';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  console.log("POST /api/product/add received");

  try {
    await ConnectDB();
    console.log("Connected to MongoDB");

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Missing or invalid authorization header");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      console.log("JWT token verified");
    } catch (error) {
      console.log("JWT verification failed:", error.message);
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name')?.trim();
    const description = formData.get('description')?.trim();
    const category = formData.get('category')?.trim();
    const priceOptionEntries = formData.getAll('priceOptions[]');

    console.log("FormData received:", { name, description, category, priceOptionEntries });

    const priceOptions = [];
    for (let i = 0; i < priceOptionEntries.length; i += 2) {
      const price = parseFloat(priceOptionEntries[i]);
      const priceDescription = priceOptionEntries[i + 1];
      if (!isNaN(price) && priceDescription) {
        priceOptions.push({ price, description: priceDescription });
      }
    }

    if (!name) {
      console.log("Validation failed: Name missing");
      return NextResponse.json({ success: false, message: "Name is required." }, { status: 400 });
    }
    if (!description) {
      console.log("Validation failed: Description missing");
      return NextResponse.json({ success: false, message: "Description is required." }, { status: 400 });
    }
    if (!category) {
      console.log("Validation failed: Category missing");
      return NextResponse.json({ success: false, message: "Category is required." }, { status: 400 });
    }
    if (!priceOptions.length || priceOptions.some(option => !option.price || !option.description)) {
      console.log("Validation failed: Invalid price options");
      return NextResponse.json({ success: false, message: "Valid price options are required." }, { status: 400 });
    }

    const files = formData.getAll('images');
    if (!files.length || !files[0]) {
      console.log("Validation failed: No image uploaded");
      return NextResponse.json({ success: false, message: "Please upload one image" }, { status: 400 });
    }

    console.log("Uploading image to Cloudinary");
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(buffer);
    });

    const imageUrl = uploadResult.secure_url;
    console.log("Image uploaded:", imageUrl);

    const userId = "user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z";
    const price = priceOptions[0].price;

    console.log("Creating product:", { userId, name, description, category, imageUrl, price, priceOptions });
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      imageUrl,
      price,
      priceOptions,
      date: Date.now(),
    });

    console.log("Product created:", newProduct);

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Backend error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}