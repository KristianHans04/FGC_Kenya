/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development warnings and error detection
  reactStrictMode: true,

  // Image configuration for static export compatibility
  images: {
    // Disable Next.js image optimization for static export
    // Images will use standard <img> tags instead of optimized versions
    unoptimized: true,

    // Use remotePatterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },



  // Experimental features configuration
  experimental: {
    // Server actions configuration (for future backend integration)
    serverActions: {
      bodySizeLimit: '2mb' // Limit payload size for security
    }
  },

  // Trailing slash for consistent URL handling on static hosts
  trailingSlash: true,
};

export default nextConfig