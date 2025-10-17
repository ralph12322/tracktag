'use client';
import React, { useState } from 'react';
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

// --- Types ---
type Review = {
  user: string;
  review: string;
  stars: number;
};

type Product = {
  title: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  url: string;
  platform: string;
  user: string;
  reviews: Review[];
  analysis: string;
};

interface Props {
  product: Product | null;
}

// --- Helpers ---
const formatPrice = (price: string, platform: string) => {
  if (!price) return "N/A";
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "N/A";
  const symbol = platform.toLowerCase() === "amazon" ? "$" : "₱";
  return `${symbol}${num.toFixed(2)}`;
};

const toNumber = (price: string): number => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
};

const StarRating = ({ stars }: { stars: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= stars ? 'text-yellow-400' : 'text-slate-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const DisplayProduct = ({ product }: Props) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!product) {
    return (
      <div className="mt-8 text-center text-slate-400 italic">
        No product selected. Search above to track an item.
      </div>
    );
  }

  const reviewsToShow = showAllReviews ? product.reviews : product.reviews.slice(0, 3);
  const basePrice = toNumber(product.originalPrice);
  const currentPrice = toNumber(product.currentPrice) || basePrice;

  // Generate mock data for chart
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const pricing = months.reduce<Record<string, number>>((acc, month) => {
    const discountRate = Math.random() * 0.45 + 0.05;
    const discount = currentPrice * discountRate;
    let price = currentPrice - discount;

    if (basePrice > 0) {
      const minBound = Math.min(basePrice, currentPrice) * 0.5;
      const maxBound = Math.max(basePrice, currentPrice);
      price = Math.min(Math.max(price, minBound), maxBound);
    }

    acc[month] = Math.round(price * 100) / 100;
    return acc;
  }, {});

  const data = Object.entries(pricing).map(([month, price]) => ({ month, price }));
  const prices = data.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const averageStars = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.stars, 0) / product.reviews.length
    : 0;


  const colorDecider = (analysis: string) => {
    switch (analysis) {
      case 'good':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50';
      case 'pwede na':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'bad':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
    }
  };
  const sentimentColor = colorDecider(product.analysis);
  const sentimentIconDecider = (analysis: string) => {
    switch (analysis) {
      case 'good':
        return '😊';
      case 'pwede na':
        return '😐';
      case 'bad':
        return '😟';
    }
  };
  const sentimentIcon = sentimentIconDecider(product.analysis);
  const currencySymbol = product.platform.toLowerCase() === "amazon" ? "$" : "₱";

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Main Card */}
      <div className="rounded-3xl shadow-2xl p-6 sm:p-8 border border-teal-500/30 bg-slate-800/40 backdrop-blur-xl max-w-[90vw] mx-auto hover:border-teal-400/60 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image */}
          <div className="flex-shrink-0 flex items-center justify-center bg-slate-700/40 rounded-2xl p-6 border border-teal-500/20">
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={400}
              height={400}
              className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg brightness-110"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col flex-grow gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block text-xs font-semibold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-500/50">
                {product.platform}
              </span>
              {product.discount && (
                <span className="inline-block text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/50">
                  {product.discount.replace('-', '')} OFF
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 leading-snug">
              {product.title}
            </h2>

            <div className="flex flex-wrap items-end gap-4">
              <p className="text-3xl sm:text-4xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-bold">
                {formatPrice(product.currentPrice, product.platform)}
              </p>
              {product.originalPrice && product.originalPrice !== product.currentPrice && (
                <p className="text-lg sm:text-xl text-slate-500 line-through mb-1">
                  {formatPrice(product.originalPrice, product.platform)}
                </p>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-700/40 rounded-xl border border-teal-500/20">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center gap-2">
                    <StarRating stars={Math.round(averageStars)} />
                    <span className="text-lg font-semibold text-slate-100">
                      {averageStars.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Based on {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className={`mt-2 sm:mt-0 sm:ml-auto px-4 py-2 rounded-lg border ${sentimentColor} flex items-center gap-2 font-medium`}>
                  <span className="text-xl">{sentimentIcon}</span>
                  <span className="capitalize">{product.analysis} po!</span>
                </div>
              </div>
            )}

            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-teal-500/20 w-full sm:w-auto"
            >
              View on {product.platform}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Price Trend */}
        <div className="mt-8 p-4 sm:p-6 bg-slate-700/40 rounded-2xl border border-teal-500/20">
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-4">
            Price Trend (Jan–Dec)
          </h3>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.3)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(m) => m.slice(0, 3)} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v: number) => `${currencySymbol}${v.toFixed(2)}`}
                  contentStyle={{ background: '#1e293b', borderRadius: '0.75rem', border: '1px solid rgba(20, 184, 166, 0.3)', color: '#e2e8f0' }}
                />
                <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                  {data.map((entry, i) => {
                    let color = '#06b6d4';
                    if (entry.price === maxPrice) color = '#ef4444';
                    if (entry.price === minPrice) color = '#10b981';
                    return <Cell key={i} fill={color} />;
                  })}
                  <LabelList dataKey="price" position="top" formatter={(l) => `${currencySymbol}${Number(l).toFixed(0)}`} style={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-slate-400">Lowest</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-slate-400">Highest</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-cyan-500 rounded-full"></div><span className="text-slate-400">Regular</span></div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6 rounded-3xl shadow-2xl p-6 sm:p-8 border border-teal-500/30 bg-slate-800/40 backdrop-blur-xl max-w-[90vw] mx-auto hover:border-teal-400/60 transition-colors duration-300">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6">
          Customer Reviews
        </h3>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsToShow.map((review, i) => (
              <div key={i} className="p-4 sm:p-5 bg-slate-700/40 rounded-xl border border-teal-500/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 break-words">{review.user}</p>
                      <StarRating stars={review.stars} />
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{review.review}</p>
              </div>
            ))}

            {product.reviews.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-200"
                >
                  {showAllReviews ? "Show Less" : `Show More (${product.reviews.length - 3} more)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-400 italic text-center">No reviews available.</p>
        )}
      </div>

    </div>
  );
};

export default DisplayProduct;