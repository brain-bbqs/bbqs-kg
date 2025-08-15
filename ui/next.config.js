/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? '/bbqs-kg' : '',
  assetPrefix: isProd ? '/bbqs-kg/' : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/bbqs-kg' : ''
  }
}
module.exports = nextConfig
