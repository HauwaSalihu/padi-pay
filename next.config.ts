const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://padiapi.padi-pay.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;