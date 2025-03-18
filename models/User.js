import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  isBlocked: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  isadmin: { type: Boolean, default: false },  
  jwtToken: { type: String }, // New field to store JWT
  cartItems: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true }
    }]
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to clear JWT (e.g., on logout)
userSchema.methods.clearJwtToken = async function () {
  this.jwtToken = undefined;
  await this.save();
};

export default mongoose.models.User || mongoose.model("User", userSchema);