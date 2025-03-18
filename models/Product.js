import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: { // Keep category field
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    priceOptions: [{
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        }
    }],
    imageUrl: {
        type: String,
        required: true,
    },

});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;