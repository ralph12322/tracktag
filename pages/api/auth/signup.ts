import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth';
import { User } from '@/lib/models/user';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, email, password } = req.body;
 

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'User already exists' });

  const newUser = await User.create({ username, email, password: hashedPassword });
  const token = generateToken(newUser._id.toString());

  // Send token in HttpOnly cookie
  res.setHeader('Set-Cookie', `authToken=${token}; HttpOnly; Path=/; Max-Age=604800`);
  res.status(201).json({ message: 'User created successfully' });
}
