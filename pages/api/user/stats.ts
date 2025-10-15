import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { Product } from '@/lib/models/product';
import { parseUserFromReq } from '@/lib/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await connectToDB();

    const user = await parseUserFromReq(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const products = await Product.find({ user: user._id });

    const totalProducts = products.length;
    const activeTracks = products.filter(p => p.analysis === '').length;
    const pastTracks = products.filter(p => p.analysis !== '').length;

    res.status(200).json({ totalProducts, activeTracks, pastTracks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
