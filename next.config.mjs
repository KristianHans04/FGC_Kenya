/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}

export default nextConfig