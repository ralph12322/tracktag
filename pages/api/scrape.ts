import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeProduct } from '@/lib/scraper';
import { Product } from '@/lib/models/product';

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

  // Check if the product already exists by its URL
  const existing = await Product.findOne({ url });

  if (existing) {
    console.log("⚠️ Product already exists in the database.");
    return res.status(200).json(existing);
  }

  // Add the URL to the scraped product object
  const saveProduct = new Product({ ...product, url });

  if (saveProduct.title) {
    await saveProduct.save(); // Always await the save
    console.log("💾 Product saved.");
  }

  return res.status(200).json(saveProduct);

} catch (error: any) {
  return res.status(500).json({ error: error.message });
}

}
