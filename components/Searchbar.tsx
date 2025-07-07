'use client'
import React, { FormEvent, useState } from 'react';
import DisplayProduct from './DisplayProduct';


type Product = {
  title: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  url: string;
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

const Searchbar = () => {
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
          {isLoading ? '...' : 'Track!'}
        </button>
      </form>

      {product && <DisplayProduct product={product} />}
    </div>
  );
};

export default Searchbar;
