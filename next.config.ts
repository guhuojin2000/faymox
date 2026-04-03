import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 会自动处理输出
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    domains: ['api.qrserver.com'],
  },
};

export default nextConfig;
