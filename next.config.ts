import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/',
        destination: '/fr',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/fr/admin',
        permanent: true,
      },
      {
        source: '/:locale/admin/dashboard',
        destination: '/:locale/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
