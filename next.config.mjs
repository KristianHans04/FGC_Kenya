/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development warnings and error detection
  reactStrictMode: true,

  // Image configuration for static export compatibility
  images: {
    // Disable Next.js image optimization for static export
    // Images will use standard <img> tags instead of optimized versions
    unoptimized: true,

    // Domains for external images (only applies in server mode, not static)
    // For static export, external images may need different handling
    domains: ['localhost', 'res.cloudinary.com'],
  },

  // Enable static export mode for GitHub Pages/Render deployment
  // This generates the 'out' directory with all static files
  output: 'export',

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