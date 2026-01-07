import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { User } from '@/lib/models/user';
import { OTP } from '@/lib/models/otp';
import { UserLog } from '@/lib/models/userLog';
import bcrypt from 'bcrypt';

type ResponseData = {
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDB();

    const { userId, otp, newPassword } = req.body;

    // Validate required fields
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      userId: user._id,
      otp: otp,
      type: 'password-reset',
    });

    if (!otpRecord) {
      await UserLog.create({
        email: user.email,
        username: user.username,
        action: 'PASSWORD_RESET',
        status: 'FAILED',
      });
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Check if OTP has expired
    const now = new Date();
    
    if (now > otpRecord.expiresAt) {
      // Delete expired OTP
      await OTP.deleteOne({ _id: otpRecord._id });
      
      await UserLog.create({
        email: user.email,
        username: user.username,
        action: 'PASSWORD_RESET',
        status: 'FAILED',
      });
      
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Delete all other password-reset OTPs for this user
    await OTP.deleteMany({ userId: user._id, type: 'password-reset' });

    // Log successful password reset
    await UserLog.create({
      email: user.email,
      username: user.username,
      action: 'PASSWORD_RESET',
      status: 'SUCCESS',
    });

    console.log(`Password reset successful for user: ${user.username}`);

    return res.status(200).json({ 
      message: 'Password reset successful! You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}