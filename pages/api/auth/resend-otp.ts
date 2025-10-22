import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/lib/models/user';
import { connectToDB } from '../start';
import { UserLog } from '@/lib/models/userLog';
import { generateOTP, sendOTPEmail } from '@/lib/alerts/gmail';
import { OTP } from '@/lib/models/otp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDB();
  const { userId, type } = req.body;

  if (!userId || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type !== 'login' && type !== 'signup') {
    return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    // 1. Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Check rate limiting - prevent spam (1 minute cooldown)
    const recentOTP = await OTP.findOne({
      userId,
      type,
      createdAt: { $gt: new Date(Date.now() - 60000) }, // Last minute
    });

    if (recentOTP) {
      return res.status(429).json({
        error: 'Please wait 60 seconds before requesting another OTP',
      });
    }

    // 3. Check hourly rate limit (5 OTPs per hour)
    const otpCount = await OTP.countDocuments({
      userId,
      type,
      createdAt: { $gt: new Date(Date.now() - 3600000) }, // Last hour
    });

    if (otpCount >= 5) {
      // Use 'LOGIN' or 'SIGNUP' action based on type
      await UserLog.create({
        email: user.email,
        username: user.username,
        action: type.toUpperCase(), // 'LOGIN' or 'SIGNUP'
        status: 'FAILED',
      });
      return res.status(429).json({
        error: 'Too many OTP requests. Please try again later.',
      });
    }

    // 4. Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Delete old OTPs for this user and type
    await OTP.deleteMany({ userId, type });

    // 6. Store new OTP
    await OTP.create({
      userId,
      otp,
      type,
      expiresAt,
      createdAt: new Date(),
    });

    console.log('✅ OTP resent:', {
      userId,
      type,
      otp: process.env.NODE_ENV === 'development' ? otp : '******',
    });

    // 7. Send OTP via Gmail
    const emailSent = await sendOTPEmail(user.email, otp, type);

    if (!emailSent) {
      // Use basic 'LOGIN' or 'SIGNUP' action
      await UserLog.create({
        email: user.email,
        username: user.username,
        action: type.toUpperCase(), // 'LOGIN' or 'SIGNUP'
        status: 'FAILED',
      });
      return res.status(500).json({
        error: 'Failed to send OTP email. Please try again.',
      });
    }

    // 8. Don't log resend separately, keep it simple
    // The actual verification will be logged

    // For development - log OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Resent OTP for user ${user.username} (${type}): ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production - only for testing
      devOTP: process.env.NODE_ENV === 'development' ? otp : undefined,
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
}