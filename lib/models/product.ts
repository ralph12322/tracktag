import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  currentPrice: { type: String, required: true },
  originalPrice: { type: String, required: true },
  discount: { type: String, required : true },
  imageUrl: { type: String },
  url: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);