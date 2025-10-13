// lib/auth.ts
import { NextApiRequest } from 'next';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function parseUserFromReq(req: NextApiRequest) {
  const token = req.cookies.authToken;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = (payload as any)?.user;
    return user || null;
  } catch {
    return null;
  }
}
