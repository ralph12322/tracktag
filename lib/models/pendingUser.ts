// lib/models/pendingUser.ts
import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PendingUser =
  mongoose.models.PendingUser || mongoose.model("PendingUser", pendingUserSchema);
