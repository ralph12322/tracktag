import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const amazonCategories = [
  { name: '👕 General Apparel', url: 'https://www.amazon.com/s?k=apparel' },
  { name: '👔 Clothing', url: 'https://www.amazon.com/s?k=clothing' },
  { name: '✨ Fashion', url: 'https://www.amazon.com/s?k=fashion' },
  { name: '👖 Casual Wear', url: 'https://www.amazon.com/s?k=casual+wear' },
  { name: '👨 Men\'s Clothing', url: 'https://www.amazon.com/s?k=mens+clothing' },
  { name: '👕 Men\'s Shirts', url: 'https://www.amazon.com/s?k=mens+shirts' },
  { name: '👖 Men\'s Pants', url: 'https://www.amazon.com/s?k=mens+pants' },
  { name: '🩳 Men\'s Shorts', url: 'https://www.amazon.com/s?k=mens+shorts' },
  { name: '🧦 Men\'s Socks', url: 'https://www.amazon.com/s?k=mens+socks' },
  { name: '🧥 Men\'s Jacket', url: 'https://www.amazon.com/s?k=mens+jacket' },
  { name: '👔 Men\'s Hoodie', url: 'https://www.amazon.com/s?k=mens+hoodie' },
  { name: '🧶 Men\'s Sweater', url: 'https://www.amazon.com/s?k=mens+sweater' },
  { name: '👩 Women\'s Clothing', url: 'https://www.amazon.com/s?k=womens+clothing' },
  { name: '👗 Women\'s Dress', url: 'https://www.amazon.com/s?k=womens+dress' },
  { name: '👚 Women\'s Tops', url: 'https://www.amazon.com/s?k=womens+tops' },
  { name: '👗 Women\'s Skirts', url: 'https://www.amazon.com/s?k=womens+skirts' },
  { name: '👖 Women\'s Pants', url: 'https://www.amazon.com/s?k=womens+pants' },
  { name: '🧦 Women\'s Socks', url: 'https://www.amazon.com/s?k=womens+socks' },
  { name: '👚 Women\'s Blouse', url: 'https://www.amazon.com/s?k=womens+blouse' },
  { name: '🧥 Women\'s Cardigan', url: 'https://www.amazon.com/s?k=womens+cardigan' },
  { name: '👕 T-Shirt', url: 'https://www.amazon.com/s?k=tshirt' },
  { name: '👔 Hoodie', url: 'https://www.amazon.com/s?k=hoodie' },
  { name: '🧥 Jackets', url: 'https://www.amazon.com/s?k=jackets' },
  { name: '🧶 Sweater', url: 'https://www.amazon.com/s?k=sweater' },
  { name: '🩲 Underwear', url: 'https://www.amazon.com/s?k=underwear' },
  { name: '😴 Pajamas', url: 'https://www.amazon.com/s?k=pajamas' },
  { name: '⚽ Sportswear', url: 'https://www.amazon.com/s?k=sportswear' },
  { name: '🛹 Streetwear', url: 'https://www.amazon.com/s?k=streetwear' },
  { name: '🏃 Activewear', url: 'https://www.amazon.com/s?k=activewear' },
];

const lazadaCategories = [
  { name: '👕 Apparel', url: 'https://www.lazada.com.ph/catalog/?q=apparel' },
  { name: '👨 Men Fashion', url: 'https://www.lazada.com.ph/catalog/?q=men+fashion' },
  { name: '👩 Women Fashion', url: 'https://www.lazada.com.ph/catalog/?q=women+fashion' },
];

export default function FloatingNavigators() {
  const [amazonExpanded, setAmazonExpanded] = useState(false);
  const [lazadaExpanded, setLazadaExpanded] = useState(false);
  const amazonRef = useRef<HTMLDivElement>(null);
  const lazadaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (amazonRef.current && !amazonRef.current.contains(event.target as Node)) {
        setAmazonExpanded(false);
      }
      if (lazadaRef.current && !lazadaRef.current.contains(event.target as Node)) {
        setLazadaExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      {/* Amazon Navigator */}
      <div ref={amazonRef} className="relative">
        <button
          onClick={() => {
            setAmazonExpanded(!amazonExpanded);
            setLazadaExpanded(false);
          }}
          className="group relative w-full"
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
        </button>

        {amazonExpanded && (
          <div className="absolute bottom-full right-0 mb-3 bg-slate-800/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-500/30 overflow-hidden w-64 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-slate-700/30">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-xl px-4 py-3 border-b border-orange-500/30">
              <h3 className="text-sm font-bold text-orange-300 flex items-center gap-2">
                <span className="text-lg">🛍️</span>
                Amazon Categories
              </h3>
            </div>
            {amazonCategories.map((category, index) => (
              <a
                key={index}
                href={category.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-slate-200 hover:bg-orange-500/20 hover:text-orange-300 transition-all border-b border-slate-700/30 last:border-b-0 hover:pl-6 duration-200"
                onClick={() => setAmazonExpanded(false)}
              >
                {category.name}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Lazada Navigator */}
      <div ref={lazadaRef} className="relative">
        <button
          onClick={() => {
            setLazadaExpanded(!lazadaExpanded);
            setAmazonExpanded(false);
          }}
          className="group relative w-full"
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
        </button>

        {lazadaExpanded && (
          <div className="absolute bottom-full right-0 mb-3 bg-slate-800/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden w-64">
            <div className="sticky top-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-xl px-4 py-3 border-b border-teal-500/30">
              <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                <span className="text-lg">🛍️</span>
                Lazada Categories
              </h3>
            </div>
            {lazadaCategories.map((category, index) => (
              <a
                key={index}
                href={category.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-slate-200 hover:bg-teal-500/20 hover:text-teal-300 transition-all border-b border-slate-700/30 last:border-b-0 hover:pl-6 duration-200"
                onClick={() => setLazadaExpanded(false)}
              >
                {category.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(249, 115, 22, 0.5);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.7);
        }
      `}</style>
    </div>
  );
}