/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecom-backendnew.kiddiequick.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.kiddiequick.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const rawBackend =
      process.env.INTERNAL_API_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://127.0.0.1:8000';

    const backendOrigin = rawBackend.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${backendOrigin}/storage/:path*`,
      },
    ];
  },
  experimental: {
    agentUpgrade: 'security',
  },
}

export default nextConfig
