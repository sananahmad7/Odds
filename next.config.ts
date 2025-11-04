/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },

  // Add this block to force Next to include Prisma client + engines in serverless bundles
  experimental: {
    outputFileTracingIncludes: {
      // App Router route handlers
      "app/**": [
        "./node_modules/@prisma/client",
        "./node_modules/.prisma/client/**/*",
      ],
      // If you also use Pages API routes, keep this; otherwise you can remove it
      "pages/api/**": [
        "./node_modules/@prisma/client",
        "./node_modules/.prisma/client/**/*",
      ],
    },
  },
};

module.exports = nextConfig;
