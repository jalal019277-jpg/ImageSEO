import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Previews use blob: and data: URLs from local processing, so next/image
  // remote patterns are not needed.
  poweredByHeader: false,
};

export default nextConfig;
