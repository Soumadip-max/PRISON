const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/orchestrator/:path*',
        destination: `${process.env.ORCHESTRATOR_INTERNAL_URL || 'http://localhost:8000'}/:path*`,
      },
      {
        source: '/api/telemetry/:path*',
        destination: `${process.env.TELEMETRY_INTERNAL_URL || 'http://localhost:8001'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
