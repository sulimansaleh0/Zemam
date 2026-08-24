import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.ngrok-free.dev',
    '*.ngrok.app',
    '*.ngrok.dev',
    'bonnet-untrimmed-rants.ngrok-free.dev',
  ],
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
