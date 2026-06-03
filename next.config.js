/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure local CSV data files are bundled into the serverless functions on Vercel.
  outputFileTracingIncludes: {
    '/**': ['./data/**/*'],
  },
};

module.exports = nextConfig;
