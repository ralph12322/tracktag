import mongoose from "mongoose";

const DiscountLogSchema = new mongoose.Schema({
  productTitle: { type: String, required: true },
  platform: { type: String, required: true },
  previousPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  user: {
    username: String,
    email: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DiscountLog ||
  mongoose.model("DiscountLog", DiscountLogSchema);
