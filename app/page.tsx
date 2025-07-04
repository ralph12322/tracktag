'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroCarousel from '@/components/HeroCarousel';
import Searchbar from '@/components/Searchbar';
import Image from 'next/image';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (error) return <h1 className="text-center text-red-500 mt-10">{error}</h1>;

  return (
    <>
      <section className='px-6 md:px-20 py-24'>
        <div className='flex max-xl:flex-col gap-16'>
          <div className='flex flex-col justify-center'>
            <p className='small-text'>
              Smarter buyer comes here
              <Image
                src='/assets/icons/arrow-right.svg'
                alt='arrow-right'
                width={16}
                height={16}
              />
            </p>

            <h1 className='head-text'>
              Unleash the Power of
              <span className='text-[#5d80ca]'> TrackTag</span>
            </h1>

            <p className='mt-6'>
              “In a world where information is vast and constantly changing, the power no longer lies in having access to data, but in making sense of it. This system empowers online shoppers to go beyond the surface, transforming scattered prices and scattered reviews into meaningful insights, enabling smarter decisions, and ensuring that the best deals are never missed.”
            </p>

            <Searchbar />
          </div>
          <HeroCarousel />
        </div>
      </section>

      <section className='trending-section'>
        <h2 className='section-text'>Trending</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-16 justify-center">
          {['Apple iPhone 15', 'Book', 'Sneakers'].map((product, index) => (
            <div
              key={index}
              className="w-64 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-800 text-center">{product}</h3>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-gray-500 text-sm py-4 sticky bottom-0">
        &copy; 2025 TrackTag. All rights reserved. Owned by Mark Ponce & Santos, Ralph
      </footer>
    </>
  );
};

export default Home;
