/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/api/**/*': ['./*.csv', './*.txt'],
  },
  async rewrites() {
    const rawBackendUrl =
      process.env.BACKEND_API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://3.148.244.66:8003';

    // Normalize target host (strip trailing /api/v1 or slash if present)
    const backendHost = rawBackendUrl
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendHost}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

