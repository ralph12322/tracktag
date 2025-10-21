'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroCarousel from '@/components/HeroCarousel';
import Searchbar from '@/components/Searchbar';
import Image from 'next/image';
import Link from 'next/link';
import getTrendingProducts from '@/lib/utils/trending';
import FeedbackCarousel from '@/components/FeedbackCarousel';

type Product = {
  name: string;
  image: string;
  currentPrice: string;
  originalPrice: string;
  discountRate?: string;
  link: string;
  platform: string;
  rating?: string;
  soldCount?: string;
}

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Cache-Control': 'no-store',
          },
        });

        if (!res.ok) throw new Error('Unauthorized');
      } catch (err) {
        setError('You must be logged in to view this page.');
        setTimeout(() => router.push('/auth/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const cached = sessionStorage.getItem("trendingProducts");
    if (cached) {
      setProducts(JSON.parse(cached));
      setLoadingProducts(false);
      return;
    }

    getTrendingProducts().then((data) => {
      if (data.length > 0) setProducts(data);
      setLoadingProducts(false);
    });
  }, []);

  const handleSearchComplete = () => {
    setShowHero(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center p-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/20">
          <h1 className="text-2xl font-bold text-red-400 mb-2">{error}</h1>
          <p className="text-slate-300">Redirecting...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-600 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>

        {/* Subtle grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      {/* Floating Platform Links */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <Link
          href="https://www.amazon.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative bg-slate-800/60 backdrop-blur-xl p-3 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transform hover:scale-110 transition-all duration-300 border border-slate-700/50 hover:border-orange-500/50">
            <Image
              src="https://1000logos.net/wp-content/uploads/2016/10/Amazon-logo-meaning.jpg"
              alt="Amazon"
              width={60}
              height={60}
              className="object-contain brightness-150"
            />
          </div>
        </Link>

        <Link
          href="https://www.lazada.com.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative bg-slate-800/60 backdrop-blur-xl p-3 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-teal-500/20 transform hover:scale-110 transition-all duration-300 border border-slate-700/50 hover:border-teal-500/50">
            <Image
              src="https://toppng.com/uploads/preview/1-1-117399190015vok5wuz1m.webp"
              alt="Lazada"
              width={60}
              height={60}
              className="object-contain brightness-150"
            />
          </div>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 md:px-20 py-32 overflow-hidden">
        <div className="relative flex max-xl:flex-col gap-16 items-center max-w-7xl mx-auto">
          <div className="flex-1 flex flex-col justify-center space-y-8 z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-slate-800/40 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-teal-500/30 w-fit hover:border-teal-400/60 transition-all duration-300 group">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <span className="text-sm font-medium text-teal-200">Smarter buying starts here</span>
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow"
                width={16}
                height={16}
                className="opacity-60 brightness-200 group-hover:translate-x-1 transition-transform"
              />
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter">
                <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                  Track
                </span>{' '}
                <span className="text-white">Smarter,</span>
                <br />
                <span className="text-white">Tag</span>{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-teal-300 to-slate-200 bg-clip-text text-transparent drop-shadow-2xl">
                  Better.
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <div className="max-w-2xl">
              <p className="text-lg text-slate-300 leading-relaxed font-light mb-4">
                Transform scattered prices and reviews into meaningful insights. Make smarter decisions and ensure the best deals are never missed.
              </p>
              <div className="flex items-start gap-2 p-3 bg-slate-700/30 border border-teal-500/30 rounded-lg">
                <svg className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-slate-400 leading-relaxed">
                  <span className="font-medium text-slate-300">Note:</span> Our database currently contains historical data for apparel products only. Items beyond this category are not yet tracked.
                </p>
              </div>
            </div>

            {/* Searchbar */}
            <div className="pt-4">
              <Searchbar onSearchComplete={handleSearchComplete} />
            </div>
          </div>

          {/* Hero Carousel */}
          {showHero && (
            <div className="flex-1 w-full z-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative border border-teal-500/30 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                  <HeroCarousel />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse animation-delay-150"></span>
                <span className="w-3 h-3 rounded-full bg-slate-400 animate-pulse animation-delay-300"></span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Trending Apparel
            </h2>
            <p className="text-slate-400 text-lg font-light">Discover what's hot right now</p>
          </div>

          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 font-medium">Fetching trending items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No trending products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((product, index) => (
                <a
                  key={index}
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-slate-800/40 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-3 border border-slate-700/50 hover:border-teal-500/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 via-transparent to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                  <div className="relative p-5 flex flex-col h-full">
                    {/* Image Container */}
                    <div className="relative mb-4 bg-slate-700/40 rounded-xl p-4 overflow-hidden border border-slate-600/50 group-hover:border-teal-500/30 transition-colors duration-300">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-contain transform group-hover:scale-110 transition-transform duration-500 brightness-110 group-hover:brightness-125"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/placeholder-apparel.png";
                        }}
                      />

                      {/* Platform Badge */}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xl px-3 py-1 rounded-lg shadow-lg border border-slate-600/50">
                        <span className="text-xs font-semibold text-slate-200">{product.platform}</span>
                      </div>

                      {/* Discount Badge */}
                      {product.discountRate && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-lg shadow-lg font-bold text-xs">
                          {product.discountRate}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 mb-3 min-h-[2.5rem] group-hover:text-teal-300 transition-colors duration-300">
                      {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          {product.currentPrice || "See Price"}
                        </p>
                      </div>

                      {product.originalPrice && product.originalPrice !== product.currentPrice && (
                        <p className="text-sm text-slate-500 line-through">
                          {product.originalPrice}
                        </p>
                      )}

                      {/* Rating & Sold Count */}
                      {(product.rating || product.soldCount) && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-600/50">
                          {product.rating && (
                            <span className="flex items-center gap-1 hover:text-teal-300 transition-colors">
                              <span className="text-yellow-400">⭐</span>
                              {product.rating}
                            </span>
                          )}
                          {product.soldCount && (
                            <span className="flex items-center gap-1">
                              <span>•</span>
                              {product.soldCount} sold
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <FeedbackCarousel />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-teal-600/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-300 py-16 mt-24">
        <div className="relative text-center space-y-2">
          <p className="text-sm font-medium text-slate-200">
            &copy; 2025 TrackTag. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Owned by Mark Ponce & Santos, Ralph
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default Home;