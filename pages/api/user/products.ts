import type { NextApiRequest, NextApiResponse } from 'next';

interface Product {
  id: string;
  name: string;
  currentPrice: string;
  originalPrice: string;
  isActive: boolean;
}

// Mock data
const mockProducts: Product[] = [
  { id: '1', name: 'Red T-Shirt', currentPrice: '$25.99', originalPrice: '$35.99', isActive: true },
  { id: '2', name: 'Blue Jeans', currentPrice: '$49.99', originalPrice: '$69.99', isActive: false },
  { id: '3', name: 'Sneakers', currentPrice: '$79.99', originalPrice: '$99.99', isActive: true },
  { id: '4', name: 'Cap', currentPrice: '$15.99', originalPrice: '$25.99', isActive: false },
];

export default function handler(req: NextApiRequest, res: NextApiResponse<Product[] | { error: string }>) {
  // Check if user is authenticated (example, replace with your auth logic)
  // For now, we'll assume user is always logged in
  if (req.method === 'GET') {
    res.status(200).json(mockProducts);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
