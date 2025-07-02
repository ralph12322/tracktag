import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  price:      { type: Number, required: true },
  description:{ type: String },
  image:      { type: String },
  createdAt:  { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);