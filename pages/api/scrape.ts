import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeProduct } from '@/lib/scraper';
import { Product } from '@/lib/models/product';
import { connectToDB } from '@/pages/api/start';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    await connectToDB();

    const product = await scrapeProduct(url);
    console.log('Scraped product:', product);

    if (!product || !product.title) {
      return res.status(404).json({ error: 'Failed to scrape product or missing title' });
    }

    const existingProduct = await Product.findOne({ title: product.title });

    if (existingProduct) {
      console.log('💾 Product already listed');
      return res.status(200).json(existingProduct);
    }

    const saveProduct = new Product(product);
    await saveProduct.save();

    console.log('💾 Product saved');
    return res.status(200).json(saveProduct);
  } catch (error: any) {
    console.log('Error scraping product:', error);
    return res.status(500).json({ error: error.message });
  }
}
