'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroCarousel from '@/components/HeroCarousel';
import Searchbar from '@/components/Searchbar';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  title: string;        // scraper returns `title`
  imageUrl: string;     // scraper returns `imageUrl`
  currentPrice: string;
  originalPrice: string;
  discount?: string;
  url: string;          // scraper returns `url`
  platform: string;
};

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  // fetch products from Amazon scraper
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/trending', { cache: 'no-store' });
        const data = await res.json();
        setProducts(data);
        console.log(data.image);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#F1F5F9]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
          <div className="relative w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
            Loading...
          </div>
        </div>
      </div>
    );
  if (error) return <h1 className="text-center text-red-500 mt-10">{error}</h1>;

  return (
    <>
      <section>
        <div className="fixed bottom-5 right-5 lg:right-48 z-10 flex flex-col md:flex-row items-center gap-6 lg:gap-20">
          <div className="flex flex-col items-center">
            <Link
              href="https://www.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://fabrikbrands.com/wp-content/uploads/Amazon-Logo-1-1155x770.png"
                alt="Amazon"
                width={80}
                height={80}
                className="hover:scale-105 transition-transform object-contain"
              />
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <Link
              href="https://www.lazada.com.ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://toppng.com/uploads/preview/1-1-117399190015vok5wuz1m.webp"
                alt="Lazada"
                width={80}
                height={80}
                className="hover:scale-105 transition-transform object-contain"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-20 py-20">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Smarter buyer comes here
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
              <span className="text-[#5d80ca]">Track</span> Smarter,
              <br />
              <span className="text-[#5d80ca]">Tag</span> Better.
            </h1>

            <p className="mt-6">
              “In a world where information is vast and constantly changing, the
              power no longer lies in having access to data, but in making sense
              of it. This system empowers online shoppers to go beyond the
              surface, transforming scattered prices and scattered reviews into
              meaningful insights, enabling smarter decisions, and ensuring that
              the best deals are never missed.”
            </p>

            <Searchbar />
          </div>
          <HeroCarousel />
        </div>
      </section>

      {/* Trending Section */}
      <section className="trending-section py-12">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl font-extrabold text-gray-800 mb-10 text-center relative inline-block">
      <span className="relative z-10 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"></span>
        Trending Apparel
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-24 h-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full"></span>
    </h2>

    {loadingProducts ? (
      <p className="text-center text-gray-500">Fetching trending items...</p>
    ) : products.length === 0 ? (
      <p className="text-center text-gray-500">No trending products found.</p>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product, index) => (
          <a
            key={index}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col items-center text-center"
          >
            {/* Image */}
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-32 h-32 object-contain mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder-apparel.png";
              }}
            />

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10">
              {product.title}
            </h3>

            {/* Prices */}
            <div className="mt-2 flex flex-col items-center">
              {/* Current Price */}
              <p className="text-green-600 font-bold text-lg">
                {product.currentPrice || "See Price"}
              </p>

              {/* Original Price (only if higher than current) */}
              {product.originalPrice &&
                product.originalPrice !== product.currentPrice && (
                  <p className="text-gray-400 line-through text-sm">
                    {product.originalPrice}
                  </p>
                )}

              {/* Discount */}
              {product.discount && (
                <p className="text-pink-500 font-semibold text-sm">
                  {product.discount}
                </p>
              )}

              {/* Platform tag */}
              <span className="mt-1 text-xs text-gray-500">
                {product.platform}
              </span>
            </div>
          </a>
        ))}
      </div>
    )}
  </div>
</section>


      <footer className="text-center text-gray-500 text-sm py-4 sticky bottom-0">
        &copy; 2025 TrackTag. All rights reserved. Owned by Mark Ponce & Santos,
        Ralph
      </footer>
    </>
  );
};

export default Home;
