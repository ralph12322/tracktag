import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth';
import { User } from '@/lib/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role: 'User',
  });

  const token = generateToken(newUser);

  res.setHeader(
    'Set-Cookie',
    `authToken=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`
  );

  res.status(201).json({ message: 'User created successfully' });
}
