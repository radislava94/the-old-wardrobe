import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["postgres"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
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
