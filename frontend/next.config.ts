import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.ngrok-free.dev',
    '*.ngrok.app',
    '*.ngrok.dev',
    'bonnet-untrimmed-rants.ngrok-free.dev',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
