import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth';
import { User } from '@/lib/models/user';
import { connectToDB } from '../start';
import { UserLog } from '@/lib/models/userLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDB();
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await UserLog.create({
      email: user.email,
      username: user.username,
      action: 'LOGIN',
      status: 'FAILED',
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);

  await UserLog.create({
    email: user.email,
    username: user.username,
    action: 'LOGIN',
    status: 'SUCCESS',
  });
  
  res.setHeader(
    'Set-Cookie',
    `authToken=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
  );
  res.status(200).json({ role: user.role });

}
