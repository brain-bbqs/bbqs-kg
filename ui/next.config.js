/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // Needed for GitHub Pages under /bbqs-kg
  basePath: isProd ? '/bbqs-kg' : '',
  assetPrefix: isProd ? '/bbqs-kg/' : undefined,
}

module.exports = nextConfig
