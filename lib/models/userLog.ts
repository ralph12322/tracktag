import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  action: { type: String, enum: ['LOGIN', 'SIGNUP'], required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export const UserLog = mongoose.models.UserLog || mongoose.model('UserLog', userLogSchema);
