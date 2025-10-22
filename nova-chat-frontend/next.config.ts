import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for better performance
  output: 'standalone',
  
  // Configure images
  images: {
    domains: [],
    unoptimized: true
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    PYTHON_BACKEND_URL: process.env.PYTHON_BACKEND_URL,
  },
  
  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
