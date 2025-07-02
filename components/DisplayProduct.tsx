'use client';
import React from 'react';
import Image from 'next/image';

type Product = {
  title: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
};

interface Props {
  product: Product | null;
}

const DisplayProduct = ({ product }: Props) => {
  if (!product) {
    return (
      <div className="mt-8 text-center text-gray-500 italic">
        No product selected. Search above to track an item.
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col md:flex-row gap-6 rounded-xl shadow-lg p-6 border border-gray-200 bg-white">
      <div className="flex-shrink-0">
        <Image
          src={product.imageUrl}
          alt={product.title}
          width={500} // or higher for sharper display on high-DPI screens
          height={500}
          className="w-64 h-64 object-contain rounded-xl"
        />
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.title}</h2>
          <p className="text-2xl text-green-600 font-bold">{product.currentPrice}</p>
          {product.originalPrice && product.originalPrice !== product.currentPrice && (
            <p className="text-gray-500 line-through">{product.originalPrice}</p>
          )}
          {product.discount && (
            <span className="inline-block mt-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {product.discount} OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayProduct;
