/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  ...(isProd ? { basePath: '/dinamica-mutua', assetPrefix: '/dinamica-mutua' } : {}),
}

module.exports = nextConfig
