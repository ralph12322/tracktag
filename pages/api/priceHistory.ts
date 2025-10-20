// pages/api/priceHistory.ts
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDB } from './start';

// Define product schema
const ProductSchema = new mongoose.Schema({
  title: String,
  currentPrice: String,
  platform: String,
  priceHistory: [{
    price: String,
    _id: mongoose.Schema.Types.ObjectId,
    month: Number,
    day: Number,
  }],
  createdAt: Date,
}, { collection: 'allproduct', strict: false });

// Use existing model or create new one
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Helper function to convert price string to number
const priceToNumber = (priceStr: string): number => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Helper to escape regex special characters
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === 'GET') {
    return handleGet(req, res);
  } else if (method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: `Method ${method} Not Allowed`,
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title } = req.query;

    // Validate required field
    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Title query parameter is required',
        example: '/api/priceHistory?title=Samsung TV',
      });
    }

    // Connect to database
    await connectToDB();

    // Case-insensitive title match with escaped regex
    const escapedTitle = escapeRegex(title);
    const mongoProduct = await Product.findOne({ 
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') } 
    }).lean() as any;

    if (!mongoProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        searchedTitle: title,
      });
    }

    // Extract price history
    const priceHistory = mongoProduct.priceHistory || [];
    const currentPrice = priceToNumber(mongoProduct.currentPrice);

    // If no price history exists, return current price as history
    if (priceHistory.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          product: {
            _id: mongoProduct._id,
            title: mongoProduct.title,
            currentPrice: currentPrice,
            platform: mongoProduct.platform,
          },
          priceHistory: [
            {
              price: currentPrice,
              date: mongoProduct.createdAt || new Date(),
              month: new Date(mongoProduct.createdAt).getMonth() + 1,
              day: new Date(mongoProduct.createdAt).getDate(),
              source: 'current',
            },
          ],
          statistics: {
            historyCount: 1,
            highestPrice: currentPrice,
            lowestPrice: currentPrice,
            averagePrice: currentPrice,
            currentPrice: currentPrice,
            priceChange: 0,
            priceChangePercent: 0,
            trend: 'stable' as const,
          },
        },
      });
    }

    // Convert price history to proper format with dates
    const formattedHistory = priceHistory.map((item: any) => {
      const year = new Date().getFullYear();
      const month = item.month || 1;
      const day = item.day || 1;
      const date = new Date(year, month - 1, day);
      
      return {
        price: priceToNumber(item.price),
        date: date.toISOString(),
        month: item.month,
        day: item.day,
      };
    });

    // Sort price history by date (oldest to newest for proper chronological order)
    const sortedHistory = [...formattedHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate price statistics
    const prices = sortedHistory.map(h => h.price);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Compare current price with the most recent historical price
    const mostRecentHistoricalPrice = sortedHistory[sortedHistory.length - 1].price;
    const priceChange = currentPrice - mostRecentHistoricalPrice;
    const priceChangePercent = mostRecentHistoricalPrice !== 0 
      ? (priceChange / mostRecentHistoricalPrice) * 100 
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        product: {
          _id: mongoProduct._id,
          title: mongoProduct.title,
          currentPrice: currentPrice,
          platform: mongoProduct.platform,
        },
        priceHistory: sortedHistory,
        statistics: {
          historyCount: sortedHistory.length,
          highestPrice: parseFloat(highestPrice.toFixed(2)),
          lowestPrice: parseFloat(lowestPrice.toFixed(2)),
          averagePrice: parseFloat(averagePrice.toFixed(2)),
          currentPrice: parseFloat(currentPrice.toFixed(2)),
          priceChange: parseFloat(priceChange.toFixed(2)),
          priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
          trend: priceChange < 0 ? 'decreasing' : priceChange > 0 ? 'increasing' : 'stable',
        },
      },
    });
  } catch (error) {
    console.error('Price history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching price history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required in request body',
      });
    }

    await connectToDB();

    // Case-insensitive title match with escaped regex
    const escapedTitle = escapeRegex(title);
    const mongoProduct = await Product.findOne({ 
      title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') } 
    }).lean() as any;

    if (!mongoProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const priceHistory = mongoProduct.priceHistory || [];
    const currentPrice = priceToNumber(mongoProduct.currentPrice);

    if (priceHistory.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          productId: mongoProduct._id,
          title: mongoProduct.title,
          currentPrice: currentPrice,
          priceHistory: [{ 
            price: currentPrice, 
            date: mongoProduct.createdAt || new Date(),
            month: new Date(mongoProduct.createdAt).getMonth() + 1,
            day: new Date(mongoProduct.createdAt).getDate(),
          }],
          count: 1,
        },
      });
    }

    // Convert and format price history
    const formattedHistory = priceHistory.map((item: any) => {
      const year = new Date().getFullYear();
      const month = item.month || 1;
      const day = item.day || 1;
      const date = new Date(year, month - 1, day);
      
      return {
        price: priceToNumber(item.price),
        date: date.toISOString(),
        month: item.month,
        day: item.day,
      };
    });

    // Sort by date (oldest to newest)
    const sortedHistory = formattedHistory.sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return res.status(200).json({
      success: true,
      data: {
        productId: mongoProduct._id,
        title: mongoProduct.title,
        currentPrice: currentPrice,
        priceHistory: sortedHistory,
        count: formattedHistory.length,
      },
    });
  } catch (error) {
    console.error('Price history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}