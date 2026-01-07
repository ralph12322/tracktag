import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import * as echarts from 'echarts';

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

type PriceHistoryData = {
  month: string;
  price: number;
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
        className={`w-4 h-4 ${star <= stars ? 'text-yellow-400' : 'text-slate-600'} transition-colors duration-200`}
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
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    //this is not being used due to the not having an automated cron job for this because of large costs

    // const fetchPriceHistory = async () => {
    //   if (!product) {
    //     setPriceHistory([]);
    //     return;
    //   }

    //   setIsLoadingHistory(true);
    //   try {
    //     const response = await fetch(
    //       `/api/price-history?title=${encodeURIComponent(product.title)}&platform=${encodeURIComponent(product.platform)}`
    //     );

    //     if (response.ok) {
    //       const result = await response.json();
    //       if (result.success && result.data) {
    //         setPriceHistory(result.data);
    //       }
    //     } else {
    //       console.error('Failed to fetch price history');
    //       setPriceHistory([]);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching price history:', error);
    //     setPriceHistory([]);
    //   } finally {
    //     setIsLoadingHistory(false);
    //   }
    // };

    //fetchPriceHistory();

    const generateMockPriceHistory = () => {
      if (!product) {
        setPriceHistory([]);
        return;
      }

      const history: PriceHistoryData[] = [];
      const now = new Date();
      const currentMonth = now.toLocaleString('default', { month: 'short' });


      for (let i = 0; i < 12; i++) {
        const month = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
        const r = Math.random();
        const price = (r > 0.7 && r < 0.9)
          ? toNumber(product.originalPrice)
          : toNumber(product.currentPrice) + (Math.random() * 100 - 50);

        history.push({ month, price: parseFloat(price.toFixed(2)) });
      }


      const index = history.findIndex(h => h.month === currentMonth);


      if (index !== -1) {
        history[index] = {
          month: currentMonth,
          price: parseFloat(product.currentPrice),
        };
      }

      setPriceHistory(history);
    };

    generateMockPriceHistory();

  }, [product]);

  // Initialize and update ECharts
  useEffect(() => {
    if (!chartRef.current || priceHistory.length === 0 || !product) return;

    // Initialize chart if not exists
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const chart = chartInstanceRef.current;
    const currencySymbol = product.platform.toLowerCase() === "amazon" ? "$" : "₱";
    const prices = priceHistory.map((d) => d.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        borderColor: 'rgba(20, 184, 166, 0.6)',
        borderWidth: 2,
        borderRadius: 12,
        padding: 12,
        textStyle: {
          color: '#e2e8f0',
          fontSize: 13
        },
        formatter: (params: any) => {
          // Find the price series (the second series, index 1)
          const priceData = params.length > 1 ? params[1] : params[0];

          return `
            <div style="padding: 4px;">
              <div style="color: #94a3b8; font-size: 11px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">${priceData.name}</div>
              <div style="color: #14b8a6; font-size: 24px; font-weight: 700;">${currencySymbol}${priceData.value.toFixed(2)}</div>
            </div>
          `;
        },
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#14b8a6',
            opacity: 0.3
          },
          lineStyle: {
            color: '#14b8a6',
            opacity: 0.5,
            width: 1,
            type: 'dashed'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: priceHistory.length > 6 ? '20%' : '15%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: priceHistory.map(d => d.month),
        axisLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.3)'
          }
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          rotate: priceHistory.length > 6 ? 45 : 0,
          fontWeight: 500
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          fontWeight: 500,
          formatter: (value: number) => {
            // Show 'k' suffix only for values >= 1000
            if (value >= 1000) {
              return `${currencySymbol}${(value / 1000).toFixed(1)}k`;
            }
            return `${currencySymbol}${value.toFixed(0)}`;
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.12)',
            type: 'dashed'
          }
        }
      },
      series: [
        // Average line
        {
          name: 'Average',
          type: 'line',
          data: priceHistory.map(() => avgPrice),
          lineStyle: {
            color: '#06b6d4',
            width: 2,
            type: 'dashed',
            opacity: 0.7
          },
          symbol: 'none',
          itemStyle: {
            color: '#06b6d4'
          },
          z: 1
        },
        // Main area chart
        {
          name: 'Price',
          type: 'line',
          data: prices,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#14b8a6',
            borderColor: '#0f172a',
            borderWidth: 2
          },
          lineStyle: {
            color: '#14b8a6',
            width: 3,
            shadowColor: 'rgba(20, 184, 166, 0.3)',
            shadowBlur: 8
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(20, 184, 166, 0.45)'
              },
              {
                offset: 0.5,
                color: 'rgba(6, 182, 212, 0.25)'
              },
              {
                offset: 1,
                color: 'rgba(8, 145, 178, 0.05)'
              }
            ])
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#14b8a6',
              borderColor: '#fff',
              borderWidth: 3,
              shadowBlur: 12,
              shadowColor: 'rgba(20, 184, 166, 0.6)'
            }
          },
          markPoint: {
            data: [
              {
                type: 'max',
                name: 'Highest',
                itemStyle: {
                  color: '#ef4444',
                  shadowColor: 'rgba(239, 68, 68, 0.4)',
                  shadowBlur: 10
                },
                label: {
                  formatter: `${currencySymbol}{c}`,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 'bold'
                }
              },
              {
                type: 'min',
                name: 'Lowest',
                itemStyle: {
                  color: '#10b981',
                  shadowColor: 'rgba(16, 185, 129, 0.4)',
                  shadowBlur: 10
                },
                label: {
                  formatter: `${currencySymbol}{c}`,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 'bold'
                }
              }
            ],
            symbolSize: 50
          },
          z: 2
        }
      ],
      animationDuration: 2000,
      animationEasing: 'cubicOut' as const
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [priceHistory, product]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  if (!product) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 text-slate-400 bg-slate-800/40 px-6 py-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="italic">No product selected. Search above to track an item.</span>
        </div>
      </div>
    );
  }

  const reviewsToShow = showAllReviews ? product.reviews : product.reviews.slice(0, 3);
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

  // Calculate min/max/avg prices from real data
  const prices = priceHistory.map((d) => d.price);
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // Calculate price change percentage
  const priceChange = prices.length >= 2
    ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
    : 0;
  const isPositiveChange = priceChange >= 0;

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Main Card */}
      <div className="rounded-3xl shadow-2xl p-6 sm:p-8 border border-teal-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl max-w-[90vw] mx-auto hover:border-teal-400/60 hover:shadow-teal-500/10 transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image */}
          <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl p-6 border border-teal-500/20 hover:border-teal-400/30 transition-all duration-300 group">
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={400}
              height={400}
              className="w-48 h-48 sm:w-64 sm:h-64 object-contain rounded-lg brightness-110 group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col flex-grow gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block text-xs font-semibold bg-teal-500/20 text-teal-300 px-3 py-1.5 rounded-full border border-teal-500/50 hover:bg-teal-500/30 transition-colors duration-200">
                {product.platform}
              </span>
              {product.discount && (
                <span className="inline-block text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/50 hover:bg-emerald-500/30 transition-colors duration-200 animate-pulse">
                  {product.discount.replace('-', '')} OFF
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 leading-snug tracking-tight">
              {product.title}
            </h2>

            <div className="flex flex-wrap items-end gap-4">
              <p className="text-4xl sm:text-5xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent font-black">
                {formatPrice(product.currentPrice, product.platform)}
              </p>
              {product.originalPrice && product.originalPrice !== product.currentPrice && (
                <p className="text-lg sm:text-xl text-slate-500 line-through mb-2 opacity-75">
                  {formatPrice(product.originalPrice, product.platform)}
                </p>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl border border-teal-500/20 hover:border-teal-400/30 transition-all duration-300">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center gap-2">
                    <StarRating stars={Math.round(averageStars)} />
                    <span className="text-lg font-bold text-slate-100">
                      {averageStars.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Based on {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className={`mt-2 sm:mt-0 sm:ml-auto px-4 py-2.5 rounded-lg border ${sentimentColor} flex items-center gap-2 font-semibold hover:scale-105 transition-transform duration-200`}>
                  <span className="text-xl">{sentimentIcon}</span>
                  <span className="capitalize">{product.analysis} po!</span>
                </div>
              </div>
            )}

            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 w-full sm:w-auto active:scale-95"
            >
              View on {product.platform}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Price Trend - ECharts */}
        <div className="mt-8 p-5 sm:p-7 bg-gradient-to-br from-slate-900/70 to-slate-800/70 rounded-2xl border border-teal-500/30 backdrop-blur-sm hover:border-teal-400/40 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Price History
            </h3>

            {priceHistory.length > 0 && (
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex flex-col items-center px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
                  <span className="text-slate-500 text-xs font-medium">Change</span>
                  <span className={`font-bold text-base ${isPositiveChange ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositiveChange ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
                  </span>
                </div>
                <div className="flex flex-col items-center px-3 py-2 bg-slate-800/60 rounded-lg border border-red-500/20">
                  <span className="text-slate-500 text-xs font-medium">High</span>
                  <span className="font-bold text-base text-red-400">{currencySymbol}{maxPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center px-3 py-2 bg-slate-800/60 rounded-lg border border-emerald-500/20">
                  <span className="text-slate-500 text-xs font-medium">Low</span>
                  <span className="font-bold text-base text-emerald-400">{currencySymbol}{minPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center px-3 py-2 bg-slate-800/60 rounded-lg border border-cyan-500/20">
                  <span className="text-slate-500 text-xs font-medium">Avg</span>
                  <span className="font-bold text-base text-cyan-400">{currencySymbol}{avgPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {isLoadingHistory ? (
            <div className="h-64 sm:h-80 w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                <div className="text-slate-400 font-medium">Loading price history...</div>
              </div>
            </div>
          ) : priceHistory.length === 0 ? (
            <div className="h-64 sm:h-80 w-full flex items-center justify-center">
              <div className="text-slate-400 font-medium">No price history available</div>
            </div>
          ) : (
            <div ref={chartRef} className="w-full h-64 sm:h-80"></div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6 rounded-3xl shadow-2xl p-6 sm:p-8 border border-teal-500/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl max-w-[90vw] mx-auto hover:border-teal-400/60 hover:shadow-teal-500/10 transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Customer Reviews
        </h3>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsToShow.map((review, i) => (
              <div key={i} className="p-5 sm:p-6 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-xl border border-teal-500/20 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {review.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 break-words">{review.user}</p>
                      <StarRating stars={review.stars} />
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{review.review}</p>
              </div>
            ))}

            {product.reviews.length > 3 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-teal-400 hover:text-teal-300 font-bold transition-all duration-200 px-6 py-2.5 rounded-lg border border-teal-500/30 hover:border-teal-400/50 hover:bg-teal-500/10 hover:scale-105 active:scale-95"
                >
                  {showAllReviews ? "Show Less" : `Show More (${product.reviews.length - 3} more)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-400 italic text-center py-8">No reviews available.</p>
        )}
      </div>

    </div>
  );
};

export default DisplayProduct;