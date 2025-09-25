import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable static exports for better PWA compatibility
  output: 'export' in process.env ? 'export' : undefined,
  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },
  // Configure headers for ONNX files
  async headers() {
    return [
      {
        source: '/(.*).onnx',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Webpack configuration for ONNX runtime
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);
