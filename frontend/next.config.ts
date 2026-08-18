import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.ngrok-free.dev',
    '*.ngrok.app',
    '*.ngrok.dev',
    'bonnet-untrimmed-rants.ngrok-free.dev',
  ],
};

export default nextConfig;
