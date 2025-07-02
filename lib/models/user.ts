
import mongoose from 'mongoose';

// === User Schema ===
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  role: {type: String, required: true},
  createdAt:{ type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);