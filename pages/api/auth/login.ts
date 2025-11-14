import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { User } from '@/lib/models/user';
import { connectToDB } from '../start';
import { UserLog } from '@/lib/models/userLog';
import { generateToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDB();
    const { username, password } = req.body;

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
    const token = generateToken(user);
    res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`);
    await UserLog.create({
      email: user.email,
      username: user.username,
      action: 'LOGIN',
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      userId: user._id.toString(),
      id: user._id.toString(), // For backwards compatibility
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