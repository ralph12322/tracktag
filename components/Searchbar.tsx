'use client'
import React, { FormEvent, useState } from 'react';
import DisplayProduct from './DisplayProduct';


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

type SearchbarProps = {
  onSearchComplete?: () => void;
};

const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    return hostname.includes('amazon.') || hostname.includes('lazada.');
  } catch (error) {
    return false;
  }
};

const Searchbar = ({ onSearchComplete }: SearchbarProps) => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const isValidLink = isValidAmazonProductURL(searchPrompt);
    if (!isValidLink) {
      alert('Please enter a valid Amazon or Lazada URL.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: searchPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error occurred');
      }

      const result = await response.json();
      setProduct(result)
      onSearchComplete?.(); // ✅ This is correct!
      console.log('Scraped product:', result);
    } catch (error: any) {
      console.error('Scrape error:', error.message);
      alert('Failed to scrape product. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full">
      <form
        className="flex flex-wrap gap-4 mt-12"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          placeholder="Enter Product Link"
          className="searchbar-input"
        />

        <button
          type="submit"
          className="searchbar-btn"
          disabled={searchPrompt === ''}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm opacity-80 animate-pulse">Tracking...</span>
            </span>
          ) : 'Track!'}
        </button>
      </form>

      {product && <DisplayProduct product={product} />}
    </div>
  );
};

export default Searchbar