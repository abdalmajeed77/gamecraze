import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      emailOrId: { type: String, default: "" },
      selectedPrice: { type: Number, default: 0 },
    },
  ],
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: "Pending" },
  contact: {
    email: { type: String, required: true },
    phone: { type: String, default: "" },
  },
  transactionImage: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);