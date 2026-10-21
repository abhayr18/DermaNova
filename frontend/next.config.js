/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/analyze',
        destination: '/',
        permanent: false,
      },
      {
        source: '/analysis',
        destination: '/',
        permanent: false,
      },
      {
        source: '/scan',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
      {
        source: '/history',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const rawUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://dermanova.onrender.com';
    const cleanUrl = rawUrl.replace(/[\r\n\t]/g, '').trim().replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

