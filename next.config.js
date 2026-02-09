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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.google.com wss://*.firebaseio.com; object-src 'none'; base-uri 'self';",
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
