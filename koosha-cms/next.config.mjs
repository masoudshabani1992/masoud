/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Allow the sandbox preview host (e2b.app) and any origin to post form actions / fetch assets
  allowedDevOrigins: ['*', '*.e2b.app'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    workerThreads: false,
    cpus: 1,
    instrumentationHook: true,
  },
};

export default nextConfig;
