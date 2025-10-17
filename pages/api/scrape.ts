import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeProduct } from '@/lib/scraper';
import { Product } from '@/lib/models/product';
import { connectToDB } from '@/pages/api/start';
import { getUserFromRequest } from '@/lib/utils/getUser';
import { TrackedProducts } from '@/lib/firebase/trackedProducts';

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

    // ✅ Get the user from the token
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const product = await scrapeProduct(url);

    if (!product || !product.title) {
      return res.status(404).json({ error: 'Failed to scrape product or missing title' });
    }

    //mongo stored product update
    const existingProduct = await Product.findOne({ title: product.title });

    //firestore tracked product update
    const trackedProduct = await TrackedProducts.get(user._id.toString());


    if (existingProduct && trackedProduct) {
      console.log('💾 Product already listed');
      const savedProduct = await Product.findOneAndUpdate(
        { title: product.title },
        { ...product, user: user._id },
        { upsert: true, new: true }
      );

      console.log('💾 Product already listed, updating if needed')
      await TrackedProducts.set(user._id.toString(), {
        user: user._id,
        title: product.title,
        currentPrice: product.currentPrice,
        email: user.email,
        url: product.url,
      })
      return res.status(200).json({message: "💾 Product already listed", productInMdb: savedProduct, productInft: trackedProduct });
    }


    console.log('➕ Adding new tracked product to Firestore')
    await TrackedProducts.set(user._id.toString(), {
      user: user._id,
      title: product.title,
      currentPrice: product.currentPrice,
      email: user.email,
      url: product.url,
    });
    console.log('💾 Product added to Firestore');

    // ✅ Inject user._id into product before saving
    const saveProduct = new Product({
      ...product,
      user: user._id,
    });

    await saveProduct.save();

    console.log('💾 Product saved with user');
    return res.status(200).json(saveProduct);
  } catch (error: any) {
    console.log('Error scraping product:', error);
    return res.status(500).json({ error: error.message });
  }
}
