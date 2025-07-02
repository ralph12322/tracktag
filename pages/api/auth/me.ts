import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth'; // jwt.verify helper
import { User } from '@/lib/models/user';
import { connectToDB } from '../start';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDB();

    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const decoded = verifyToken(token); // your jwt verify helper
    const user = await User.findById(decoded.userId).select('username email');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
