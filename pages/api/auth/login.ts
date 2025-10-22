import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { User } from '@/lib/models/user';
import { connectToDB } from '../start';
import { UserLog } from '@/lib/models/userLog';
import { generateOTP, sendOTPEmail } from '@/lib/alerts/gmail';
import { OTP } from '@/lib/models/otp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDB();
    const { username, password } = req.body;
    console.log(req.body)

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 2. Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      await UserLog.create({
        email: 'unknown',
        username,
        action: 'LOGIN',
        status: 'FAILED',
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await UserLog.create({
        email: user.email,
        username: user.username,
        action: 'LOGIN',
        status: 'FAILED',
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Check if account is verified (for signup flow)
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email first',
        userId: user._id.toString(),
        needsVerification: true,
      });
    }

    // 5. Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 6. Delete old login OTPs for this user
    await OTP.deleteMany({ userId: user._id, type: 'login' });

    // 7. Store new OTP
    const otpRecord = await OTP.create({
      userId: user._id,
      otp,
      type: 'login',
      expiresAt,
      createdAt: new Date(),
    });

    console.log('✅ OTP created in database:', {
      otpId: otpRecord._id,
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : '******',
      expiresAt
    });

    // 8. Send OTP via email
    console.log(`📧 Attempting to send OTP to: ${user.email}`);
    const emailSent = await sendOTPEmail(user.email, otp, 'login');

    if (!emailSent) {
      // Clean up OTP if email fails
      await OTP.deleteOne({ _id: otpRecord._id });
      
      console.error('❌ Failed to send OTP email');
      return res.status(500).json({
        error: 'Failed to send OTP. Please try again.',
      });
    }

    console.log('✅ OTP email sent successfully');

    // For development - log OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 LOGIN OTP for ${user.username}: ${otp}`);
      console.log(`⏰ Expires at: ${expiresAt}`);
    }

    // 9. Return success with userId (CRITICAL: Your frontend needs this!)
    return res.status(200).json({
      success: true,
      userId: user._id.toString(),
      id: user._id.toString(), // For backwards compatibility
      message: 'OTP sent to your email',
      devOTP: process.env.NODE_ENV === 'development' ? otp : undefined,
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ 
      error: 'Login failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    });
  }
}