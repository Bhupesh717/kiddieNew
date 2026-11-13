/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
  },
  experimental: {
    agentUpgrade: 'security',
  },
}

export default nextConfig
