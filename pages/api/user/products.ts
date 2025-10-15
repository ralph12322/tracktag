import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { Product } from '@/lib/models/product'; // adjust path if needed
import { parseUserFromReq } from '@/lib/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.setHeader('Cache-Control', 'no-store');
  await connectToDB();

  if (req.method === 'GET') {
    try {
      const user = await parseUserFromReq(req);
      const products = await Product.find({ user: user._id }).sort({ createdAt: -1 }); // latest first
      res.status(200).json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
