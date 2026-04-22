import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@noble/post-quantum'],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
  // Add empty turbopack config to acknowledge Turbopack usage
  // The extension aliasing in webpack is handled automatically by Turbopack
  turbopack: {},
};

export default nextConfig;
