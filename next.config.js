/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/connect-softrestaurant', destination: '/set-bar-name', permanent: true }];
  },
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon.svg' }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self'; base-uri 'self';",
          },
        ],
      },
    ];
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configuración webpack para optimizar CSS
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimizar la carga de CSS y evitar warnings de preload
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            styles: {
              name: 'styles',
              test: /\.(css|scss)$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig
