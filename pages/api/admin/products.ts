import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/pages/api/start';
import { Product } from '@/lib/models/product';
require('@/lib/models/user');
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectToDB();

  const products = await Product.find()
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(products);
}

