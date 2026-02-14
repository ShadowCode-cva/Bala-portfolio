/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow large file uploads — 500MB max
  // Note: This is a global limit. The upload API route has its own
  // per-file validation (10MB images, 500MB videos).
  // For 4GB+, you'd need nginx proxy or direct S3 uploads.
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  // Ensure trailing slashes are consistent for SEO and Vercel
  trailingSlash: true,
  // Optimize for Docker containers
  output: 'standalone',
}

export default nextConfig

