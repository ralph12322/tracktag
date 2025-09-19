'use client';
import React from 'react';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
} from 'recharts';

type Product = {
  title: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  url: string;
  platform: string;
  user: string;
};

interface Props {
  product: Product | null;
};

// --- Helpers ---
const formatPrice = (price: string) => {
  if (!price) return "N/A";
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "N/A";
  return `$${num.toFixed(2)}`;
};

const toNumber = (price: string): number => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
};

const DisplayProduct = ({ product }: Props) => {
  if (!product) {
    return (
      <div className="mt-8 text-center text-gray-500 italic">
        No product selected. Search above to track an item.
      </div>
    );
  }

  const basePrice = toNumber(product.originalPrice);
  const currentPrice = toNumber(product.currentPrice) || basePrice;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate fake trend data around current/original price
  const pricing = months.reduce<Record<string, number>>((acc, month) => {
    // Random discount between 5% and 50%
    const discountRate = Math.random() * 0.45 + 0.05;
    const discount = currentPrice * discountRate;

    let price = currentPrice - discount;

    // Keep prices within a realistic bound
    if (basePrice > 0) {
      const minBound = Math.min(basePrice, currentPrice) * 0.5; // at least 50% of base
      const maxBound = Math.max(basePrice, currentPrice);       // cannot exceed original
      price = Math.min(Math.max(price, minBound), maxBound);
    }

    acc[month] = Math.round(price * 100) / 100; // keep 2 decimals
    return acc;
  }, {});


  const data = Object.entries(pricing).map(([month, price]) => ({
    month,
    price,
  }));

  const prices = data.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  return (
    <div className="mt-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 rounded-2xl shadow-md p-6 border border-gray-100 bg-white">
      {/* Product Image */}
      <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl p-4">
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={400}
          height={400}
          className="w-56 h-56 object-contain rounded-lg"
        />
      </div>

      {/* Product Info + Chart */}
      <div className="flex flex-col flex-grow gap-6">
        {/* Product Details */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-snug">
            {product.title}
          </h2>
          <div className="mt-2">
            <p className="text-2xl text-green-600 font-bold">
              {formatPrice(product.currentPrice)}
            </p>

            {product.originalPrice &&
              product.originalPrice !== product.currentPrice && (
                <p className="text-gray-400 line-through text-sm">
                  {formatPrice(product.originalPrice)}
                </p>
              )}

            {product.discount && (
              <span className="inline-block mt-2 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-lg">
                {product.discount.replace('-', '')} OFF
              </span>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Price Trend (Jan–Dec)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(month) => month.slice(0, 3)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#374151',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              />
              <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => {
                  let color = '#3b82f6'; // default blue
                  if (entry.price === maxPrice) color = '#ef4444';
                  if (entry.price === minPrice) color = '#22c55e';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
                <LabelList
                  dataKey="price"
                  position="top"
                  formatter={(label) => {
                    if (typeof label === 'number') {
                      return `$${label.toFixed(2)}`;
                    }
                    return '';
                  }}
                  style={{ fontSize: 10, fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DisplayProduct;
