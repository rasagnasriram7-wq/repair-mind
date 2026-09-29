/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow image domains if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@google/genai'],
  },
};

export default nextConfig;
