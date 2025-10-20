'use client';
import React, { useState, useEffect } from 'react';
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
  const [priceHistoryData, setPriceHistoryData] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch real price history data
  useEffect(() => {
    if (product?.title) {
      setIsLoadingHistory(true);
      setHistoryError(null);
      
      // CHANGED: Updated endpoint to match your API filename
      fetch(`/api/priceHistory?title=${encodeURIComponent(product.title)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`API returned ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setPriceHistoryData(data.data);
          } else {
            setHistoryError(data.message || 'Failed to load price history');
          }
        })
        .catch(err => {
          console.error('Failed to fetch price history:', err);
          setHistoryError('Unable to load price history');
        })
        .finally(() => {
          setIsLoadingHistory(false);
        });
    }
  }, [product?.title]);

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

  // Use real price history data or fallback to mock if not available
  let data: Array<{ month: string; price: number }> = [];
  let maxPrice = currentPrice;
  let minPrice = currentPrice;
  let isRealData = false;

  if (priceHistoryData && priceHistoryData.priceHistory && priceHistoryData.priceHistory.length > 0) {
    isRealData = true;
    
    // Use real data from API
    data = priceHistoryData.priceHistory.map((item: any) => {
      const date = new Date(item.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      return {
        month: `${monthName} ${day}`,
        price: item.price
      };
    });

    // Get statistics from API if available
    if (priceHistoryData.statistics) {
      maxPrice = priceHistoryData.statistics.highestPrice;
      minPrice = priceHistoryData.statistics.lowestPrice;
    } else {
      // Calculate from data
      const prices = data.map(d => d.price);
      maxPrice = Math.max(...prices);
      minPrice = Math.min(...prices);
    }
  } else if (!isLoadingHistory && !historyError) {
    // Fallback to mock data generation if API fails or returns no history
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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

    data = Object.entries(pricing).map(([month, price]) => ({ month, price }));
    const prices = data.map((d) => d.price);
    maxPrice = Math.max(...prices);
    minPrice = Math.min(...prices);
  }

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              Price Trend
            </h3>
            {isRealData && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/50">
                Historical Data
              </span>
            )}
            {!isRealData && !isLoadingHistory && !historyError && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/50">
                Estimated
              </span>
            )}
          </div>
          
          {isLoadingHistory ? (
            <div className="h-64 sm:h-80 w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-slate-400">Loading price history...</div>
              </div>
            </div>
          ) : historyError ? (
            <div className="h-64 sm:h-80 w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-slate-400">{historyError}</div>
                <button
                  onClick={() => {
                    setHistoryError(null);
                    setIsLoadingHistory(true);
                    fetch(`/api/priceHistory?title=${encodeURIComponent(product.title)}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          setPriceHistoryData(data.data);
                        }
                      })
                      .catch(err => setHistoryError('Unable to load price history'))
                      .finally(() => setIsLoadingHistory(false));
                  }}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : data.length > 0 ? (
            <>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.3)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11, fill: '#94a3b8' }} 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(v: number) => `${currencySymbol}${v.toFixed(2)}`}
                      contentStyle={{ 
                        background: '#1e293b', 
                        borderRadius: '0.75rem', 
                        border: '1px solid rgba(20, 184, 166, 0.3)', 
                        color: '#e2e8f0' 
                      }}
                    />
                    <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                      {data.map((entry, i) => {
                        let color = '#06b6d4';
                        if (entry.price === maxPrice) color = '#ef4444';
                        if (entry.price === minPrice) color = '#10b981';
                        return <Cell key={i} fill={color} />;
                      })}
                      <LabelList 
                        dataKey="price" 
                        position="top" 
                        formatter={(l) => `${currencySymbol}${Number(l).toFixed(0)}`} 
                        style={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }} 
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-400">Lowest: {currencySymbol}{minPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-400">Highest: {currencySymbol}{maxPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-slate-400">Regular</span>
                </div>
              </div>

              {/* Price Statistics */}
              {priceHistoryData?.statistics && (
                <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-teal-500/10">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Average</p>
                      <p className="text-sm font-semibold text-slate-200">
                        {currencySymbol}{priceHistoryData.statistics.averagePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Change</p>
                      <p className={`text-sm font-semibold ${
                        priceHistoryData.statistics.priceChange < 0 ? 'text-emerald-400' : 
                        priceHistoryData.statistics.priceChange > 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {priceHistoryData.statistics.priceChange > 0 ? '+' : ''}
                        {currencySymbol}{priceHistoryData.statistics.priceChange.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">% Change</p>
                      <p className={`text-sm font-semibold ${
                        priceHistoryData.statistics.priceChangePercent < 0 ? 'text-emerald-400' : 
                        priceHistoryData.statistics.priceChangePercent > 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {priceHistoryData.statistics.priceChangePercent > 0 ? '+' : ''}
                        {priceHistoryData.statistics.priceChangePercent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Trend</p>
                      <p className="text-sm font-semibold text-slate-200 capitalize">
                        {priceHistoryData.statistics.trend === 'decreasing' && '📉 '}
                        {priceHistoryData.statistics.trend === 'increasing' && '📈 '}
                        {priceHistoryData.statistics.trend === 'stable'}
                        {priceHistoryData.statistics.trend}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 sm:h-80 w-full flex items-center justify-center">
              <div className="text-slate-400">No price history available</div>
            </div>
          )}
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