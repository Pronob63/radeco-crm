/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // P0: images.unoptimized=true — workaround CVE GHSA-h25m-26qc-wcjf
    // (Next.js self-hosted DoS via Image Optimization, next@14.2.35)
    // Revisitar al hacer upgrade a Next.js 15+
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // P0: reducido de 10mb → 2mb para evitar spikes de RAM en Hostinger
      bodySizeLimit: '2mb',
    },
    outputFileTracingIncludes: {
      '/*': ['./prisma/**'],
    },
  },
}

module.exports = nextConfig
