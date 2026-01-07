import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { User } from '@/lib/models/user';
import { OTP } from '@/lib/models/otp';
import { UserLog } from '@/lib/models/userLog';
import { generateOTP, sendOTPEmail, sendHtmlEmail } from '@/lib/alerts/gmail';

type ResponseData = {
  message?: string;
  error?: string;
  success?: boolean;
  devOTP?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDB();

    const { userId, type } = req.body;

    // Validate required fields
    if (!userId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate type
    if (!['login', 'signup', 'password-reset'].includes(type)) {
      return res.status(400).json({ error: 'Invalid OTP type' });
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check rate limiting - prevent spam (1 minute cooldown)
    const recentOTP = await OTP.findOne({
      userId: user._id,
      type,
      createdAt: { $gt: new Date(Date.now() - 60000) },
    });

    if (recentOTP) {
      const timeDiff = Date.now() - recentOTP.createdAt.getTime();
      const remainingSeconds = Math.ceil((60000 - timeDiff) / 1000);
      return res.status(429).json({
        error: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      });
    }

    // Check hourly rate limit (5 OTPs per hour)
    const otpCount = await OTP.countDocuments({
      userId: user._id,
      type,
      createdAt: { $gt: new Date(Date.now() - 3600000) },
    });

    if (otpCount >= 5) {
      const action = type === 'password-reset' ? 'PASSWORD_RESET' : type.toUpperCase();
      await UserLog.create({
        email: user.email,
        username: user.username,
        action,
        status: 'FAILED',
      });
      return res.status(429).json({
        error: 'Too many OTP requests. Please try again later.',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this user and type
    await OTP.deleteMany({ userId: user._id, type });

    // Store new OTP
    await OTP.create({
      userId: user._id,
      otp,
      type,
      expiresAt,
      createdAt: new Date(),
    });

    console.log('✅ OTP resent:', {
      userId: user._id,
      type,
      otp: process.env.NODE_ENV === 'development' ? otp : '******',
    });

    // Send OTP email based on type
    try {
      if (type === 'login' || type === 'signup') {
        const emailSent = await sendOTPEmail(user.email, otp, type as 'login' | 'signup');
        
        if (!emailSent) {
          const action = type.toUpperCase();
          await UserLog.create({
            email: user.email,
            username: user.username,
            action,
            status: 'FAILED',
          });
          return res.status(500).json({
            error: 'Failed to send OTP email. Please try again.',
          });
        }
      } else if (type === 'password-reset') {
        const subject = 'TrackTag - Password Reset Code';
        const html = getPasswordResetEmailTemplate(otp, user.username);
        await sendHtmlEmail(user.email, subject, html);
      }
      
      console.log(`OTP resent to ${user.email} for ${type}`);
    } catch (emailError) {
      console.error('Error resending OTP email:', emailError);
      
      const action = type === 'password-reset' ? 'PASSWORD_RESET' : type.toUpperCase();
      await UserLog.create({
        email: user.email,
        username: user.username,
        action,
        status: 'FAILED',
      });
      
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
    }

    // For development - log OTP
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Resent OTP for user ${user.username} (${type}): ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      devOTP: process.env.NODE_ENV === 'development' ? otp : undefined,
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
}

function getPasswordResetEmailTemplate(otp: string, username: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        h1 {
          color: white;
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 800;
        }
        h2 {
          color: #0f172a;
          margin: 0 0 15px 0;
          font-size: 24px;
        }
        .otp-code {
          font-size: 42px;
          font-weight: bold;
          letter-spacing: 12px;
          color: #0d9488;
          background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border: 2px solid #99f6e4;
        }
        .info-text {
          color: #475569;
          font-size: 16px;
          margin: 15px 0;
        }
        .warning-text {
          color: #dc2626;
          font-weight: 600;
          font-size: 15px;
          margin: 20px 0;
        }
        .security-note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          text-align: left;
        }
        .security-note p {
          margin: 5px 0;
          color: #78350f;
          font-size: 14px;
        }
        .footer {
          color: #e0f2fe;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .footer p {
          margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            padding: 30px 15px;
          }
          .content {
            padding: 20px;
          }
          .otp-code {
            font-size: 36px;
            letter-spacing: 8px;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="logo">🔒</div>
          <h1>TrackTag</h1>
          
          <div class="content">
            <h2>Password Reset Request</h2>
            <p class="info-text">Hello <strong>${username}</strong>,</p>
            <p class="info-text">We received a request to reset your password. Use the code below to proceed:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p class="warning-text">⏱️ This code will expire in 10 minutes</p>
            
            <div class="security-note">
              <p><strong>🛡️ Security Alert:</strong></p>
              <p>• Never share this code with anyone</p>
              <p>• TrackTag staff will never ask for your verification code</p>
              <p>• If you didn't request this, please secure your account immediately</p>
            </div>
            
            <p class="info-text">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>TrackTag Team</strong></p>
            <p>© ${new Date().getFullYear()} TrackTag. All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}