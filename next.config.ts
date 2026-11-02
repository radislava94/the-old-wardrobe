import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    globalNotFound: true,
  },
  async rewrites() {
    return [
      {
        source: "/sitemap/:country.xml",
        destination: "/sitemap/:country",
      },
    ];
  },
};

export default nextConfig;
