/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    webpackBuildWorker: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/team",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/calculator",
        destination: "/estimate",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
