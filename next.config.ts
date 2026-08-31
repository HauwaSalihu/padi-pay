const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://padi-pay-backend.onrender.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;