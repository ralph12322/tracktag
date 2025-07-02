import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeProduct } from '@/lib/scraper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    const product = await scrapeProduct(url);
    console.log('Scraped product:', product);

    return res.status(200).json(product);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
