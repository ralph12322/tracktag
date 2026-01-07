import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/pages/api/start';
import { UserLog } from '@/lib/models/userLog';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDB();

  const logs = await UserLog.find().sort({ createdAt: -1 }).limit(50).lean();

  res.status(200).json(logs);
}
