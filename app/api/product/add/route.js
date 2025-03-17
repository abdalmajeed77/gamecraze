import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import ConnectDB from '@/config/db.js';
import Product from '@/models/Product.js';
import { Buffer } from 'buffer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  await ConnectDB();

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.trim();
    const description = formData.get('description')?.trim();
    const category = formData.get('category')?.trim();
    const priceOptions = [];
    const priceOptionEntries = formData.getAll('priceOptions[]');

    // Parse price options (assuming pairs of price and description)
    for (let i = 0; i < priceOptionEntries.length; i += 2) {
      const price = parseFloat(priceOptionEntries[i]);
      const priceDescription = priceOptionEntries[i + 1];
      if (!isNaN(price) && priceDescription) {
        priceOptions.push({
          price,
          description: priceDescription
        });
      }
    }

    // Debugging logs
    console.log("Incoming Data:", { name, description, category, priceOptions });

    // Validation
    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required." });
    }
    if (!description) {
      return NextResponse.json({ success: false, message: "Description is required." });
    }
    if (!category) {
      return NextResponse.json({ success: false, message: "Category is required." });
    }
    if (!priceOptions || priceOptions.length === 0 || priceOptions.some(option => !option.price || !option.description)) {
      return NextResponse.json({ success: false, message: "Valid price options are required." });
    }

    const files = formData.getAll('images');
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "Please upload at least one image" });
    }

    // Upload images to Cloudinary
    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrl = result[0].secure_url; // Use the first image as imageUrl
    const userId = "user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z"; // Hardcoded for testing
    const price = priceOptions[0].price; // Use the first price option as the base price

    console.log("Creating new product with data:", {
      userId,
      name,
      description,
      category,
      imageUrl,
      price,
      priceOptions,
    });

    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      imageUrl,       // Changed from images to imageUrl to match schema
      price,         // Added to satisfy schema requirement
      priceOptions,  // Array of price options
      date: Date.now()
    });

    return NextResponse.json({
      success: true,
      message: "The new game added successfully",
      data: newProduct
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}