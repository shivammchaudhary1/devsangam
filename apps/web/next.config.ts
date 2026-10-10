import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Public URL compatibility for an existing .env during migration; no secrets.
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // SSR contains public content or a generic client auth shell, never account data.
          { key: 'X-DevSangam-Offline-Shell', value: 'true' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/auth/:path*',
        headers: [{ key: 'X-DevSangam-Offline-Shell', value: 'false' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      { source: '/push-sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ];
  },
};
export default nextConfig;
