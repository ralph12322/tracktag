// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  images: {
    domains: ['img.lazcdn.com', 'm.media-amazon.com', 'images.pexels.com', 'images.ctfassets.net', 'www.fishingstation.com', 'images.unsplash.com', 'www.fishingstation.com.au',
      'www.citypng.com',
      'toppng.com',
      'images-na.ssl-images-amazon.com',
      'img.lazcdn.com',
      'laz-img-cdn.alicdn.com',
      'cf.shopee.ph',
      'deo.shopeemobile.com',
      'fabrikbrands.com',
      'ph-live.slatic.net',]
  },
};

module.exports = nextConfig;
