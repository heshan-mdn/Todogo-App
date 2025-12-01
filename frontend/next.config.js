/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
  },
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
