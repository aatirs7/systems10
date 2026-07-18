/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // File uploads via Server Actions (CSV ingestion) can exceed the default 1mb limit.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
