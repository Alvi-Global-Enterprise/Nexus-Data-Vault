/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/api/**/*': ['./*.csv', './*.txt'],
  },
};

module.exports = nextConfig;
