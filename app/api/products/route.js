import { NextResponse } from "next/server";
import ConnectDB from "@/config/db.js";
import Product from "@/models/Product.js";
import { Buffer } from "buffer";

// GET handler to fetch all products
export async function GET() {
  try {
    await ConnectDB();
    const products = await Product.find();
    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: true, data: [], message: "No products found" },
        { status: 200 }
      );
    }
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler to create a new product
export async function POST(request) {
  try {
    await ConnectDB();

    // Dynamically import cloudinary to ensure server-side execution
    const { v2: cloudinary } = await import("cloudinary");

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Parse form data
    const formData = await request.formData();
    const name = formData.get("name")?.trim();
    const description = formData.get("description")?.trim();
    const category = formData.get("category")?.trim();
    const priceOptions = [];
    const priceOptionEntries = formData.getAll("priceOptions[]");

    // Parse price options (assuming pairs of price and description)
    for (let i = 0; i < priceOptionEntries.length; i += 2) {
      const price = parseFloat(priceOptionEntries[i]);
      const priceDescription = priceOptionEntries[i + 1]?.trim();
      if (!isNaN(price) && priceDescription) {
        priceOptions.push({
          price,
          description: priceDescription,
        });
      }
    }

    // Debugging logs
    console.log("Incoming Data:", { name, description, category, priceOptions });

    // Validation
    if (!name || name.length === 0) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }
    if (!description || description.length === 0) {
      return NextResponse.json({ success: false, message: "Description is required" }, { status: 400 });
    }
    if (!category || category.length === 0) {
      return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 });
    }
    if (!priceOptions || priceOptions.length === 0 || priceOptions.some((option) => !option.price || !option.description)) {
      return NextResponse.json({ success: false, message: "Valid price options are required" }, { status: 400 });
    }

    const files = formData.getAll("images");
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "Please upload at least one image" }, { status: 400 });
    }

    // Upload images to Cloudinary
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "products" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploadResults; // Store all uploaded image URLs
    const imageUrl = imageUrls[0]; // Use the first image as the primary imageUrl
    const userId = "user_2tBAUP9DmQ48Ll2sDPcPs5Ru18z"; // Hardcoded for testing
    const price = priceOptions[0].price; // Use the first price option as the base price

    console.log("Creating new product with data:", {
      userId,
      name,
      description,
      category,
      imageUrls,
      imageUrl,
      price,
      priceOptions,
    });

    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      imageUrls,
      imageUrl,
      price,
      priceOptions,
      date: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "The new game added successfully",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/products:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT handler to update a product
export async function PUT(request) {
  try {
    await ConnectDB();

    // Dynamically import cloudinary for image updates
    const { v2: cloudinary } = await import("cloudinary");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Parse form data
    const formData = await request.formData();
    const productId = formData.get("productId")?.trim();
    const name = formData.get("name")?.trim();
    const description = formData.get("description")?.trim();
    const category = formData.get("category")?.trim();
    const price = formData.get("price") ? parseFloat(formData.get("price")) : null;

    // Parse price options updates
    const priceOptionsUpdates = [];
    const priceOptionIds = formData.getAll("priceOptionIds[]");
    const priceOptionPrices = formData.getAll("priceOptionPrices[]");
    const priceOptionDescriptions = formData.getAll("priceOptionDescriptions[]");

    // Build updated price options
    for (let i = 0; i < priceOptionIds.length; i++) {
      const price = parseFloat(priceOptionPrices[i]);
      const description = priceOptionDescriptions[i]?.trim();
      if (!isNaN(price) && description) {
        priceOptionsUpdates.push({
          _id: priceOptionIds[i] || undefined, // Use _id if updating an existing option, undefined for new
          price,
          description,
        });
      }
    }

    // Validation
    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // Update fields if provided
    if (name && name.length > 0) product.name = name;
    if (description && description.length > 0) product.description = description;
    if (category && category.length > 0) product.category = category;
    if (price && !isNaN(price)) product.price = price;

    // Update price options
    if (priceOptionsUpdates.length > 0) {
      if (priceOptionsUpdates.some((option) => !option.price || !option.description)) {
        return NextResponse.json(
          { success: false, message: "Each price option must have a price and description" },
          { status: 400 }
        );
      }

      // Update existing price options and add new ones
      const updatedPriceOptions = [];
      for (const update of priceOptionsUpdates) {
        if (update._id) {
          // Update existing price option
          const existingOption = product.priceOptions.id(update._id);
          if (existingOption) {
            existingOption.price = update.price;
            existingOption.description = update.description;
            updatedPriceOptions.push(existingOption);
          }
        } else {
          // Add new price option
          updatedPriceOptions.push({ price: update.price, description: update.description });
        }
      }
      product.priceOptions = updatedPriceOptions;

      // If price wasn't explicitly updated, set it to the first price option
      if (!price || isNaN(price)) {
        product.price = product.priceOptions[0]?.price || product.price;
      }
    }

    // Handle image updates if new images are provided
    const files = formData.getAll("images");
    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto", folder: "products" },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            stream.end(buffer);
          });
        })
      );

      const newImageUrls = uploadResults;
      product.imageUrls = newImageUrls; // Replace all image URLs
      product.imageUrl = newImageUrls[0]; // Update primary image URL
    }

    await product.save();
    return NextResponse.json(
      { success: true, message: "Product updated successfully", data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a product
export async function DELETE(request) {
  try {
    await ConnectDB();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const result = await Product.findByIdAndDelete(productId);
    if (!result) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}