import { jwtVerify } from 'jose';
import type { NextApiRequest } from 'next';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getUserFromRequest(req: NextApiRequest) {
  const token = req.cookies.authToken;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload as any)?.user || null;
  } catch (error) {
    return null;
  }
}
