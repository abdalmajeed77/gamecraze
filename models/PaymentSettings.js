import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema({
  paymentMethods: {
    Stripe: { type: Boolean, default: true },
    PayPal: { type: Boolean, default: true },
    UPI: { type: Boolean, default: true },
    BankTransfer: { type: Boolean, default: true },
    Crypto: { type: Boolean, default: false },
  },
  customMethods: [
    {
      type: { type: String, enum: ["UPI", "BankTransfer"], required: true },
      details: {
        upiId: { type: String, default: "" }, // For UPI
        bankName: { type: String, default: "" }, // For Bank Transfer
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
      },
      isActive: { type: Boolean, default: true },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.PaymentSettings || mongoose.model("PaymentSettings", paymentSettingsSchema);