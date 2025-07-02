// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  images: {
    domains: ['img.lazcdn.com', 'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'img.lazcdn.com',
      'laz-img-cdn.alicdn.com',
      'cf.shopee.ph',
      'deo.shopeemobile.com',
      'ph-live.slatic.net',], // ✅ Lazada's CDN
  },
};

module.exports = nextConfig;
