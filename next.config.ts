import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remote images are rendered with plain <img> tags (the sources are arbitrary
  // user-supplied URLs), so no next/image remotePatterns are required.
  poweredByHeader: false,
};

export default nextConfig;
