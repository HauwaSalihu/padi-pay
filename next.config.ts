const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://padi-pay-backend-production.up.railway.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;