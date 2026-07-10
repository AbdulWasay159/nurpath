/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Next.js automatic scroll-to-top on route changes —
  // we manage sidebar scroll position manually in Navbar.jsx
  experimental: {
    scrollRestoration: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'i.imgur.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
