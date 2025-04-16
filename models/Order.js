import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      gameid: { type: Number, required: true },
      product: { type: String, required: true },
      priceoptions: [
        {
          price: { type: Number, required: true },
          description: { type: String, required: true },
        },
      ],
      status: { type: String, required: true, default: "pending" },
      date: { type: Date, required: true, default: Date.now },
    },
  ],
});

const Order = mongoose.models.order || mongoose.model("order", orderSchema);
export default Order;