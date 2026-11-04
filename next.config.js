/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/urna',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/urna',
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
