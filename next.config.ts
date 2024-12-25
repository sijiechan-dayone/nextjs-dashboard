import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    experimental: {
        ppr: false,
      },
};

export default nextConfig;
