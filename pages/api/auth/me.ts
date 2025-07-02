import { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'No token found' });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = (payload as any)?.user;
    if (!user) return res.status(401).json({ error: 'Invalid token structure' });

    res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
