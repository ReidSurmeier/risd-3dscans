/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'risdmuseum.org',
      },
      {
        protocol: 'https',
        hostname: '*.risdmuseum.org',
      },
      {
        protocol: 'https',
        hostname: 'risdmuseum.cdn.picturepark.com',
      },
      {
        protocol: 'https',
        hostname: 'images.metmuseum.org',
      },
      {
        protocol: 'https',
        hostname: 'collectionapi.metmuseum.org',
      },
    ],
  },
}

module.exports = nextConfig
