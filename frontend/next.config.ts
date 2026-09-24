import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.10.130',
    '192.168.10.130:3000',
    'localhost:3000',
    '127.0.0.1:3000',
    '10.188.20.210:3000',
    '10.188.20.210',
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
      {
        source: '/socket.io/:path*',
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
