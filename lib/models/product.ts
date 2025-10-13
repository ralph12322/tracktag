import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  review: { type: String, required: true },
  stars: { type: Number, required: true, min: 0, max: 5 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  currentPrice: { type: String, required: true },
  originalPrice: { type: String, required: false },
  discount: { type: String, required: false },
  imageUrl: { type: String },
  platform: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  url: { type: String },
  reviews: { type: [reviewSchema], default: [] },  // ✅ Added reviews field
  analysis: { type: String, default: '' },          // ✅ Added analysis field
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);