import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mk/search", "/bg/search", "/sr-rs/search", "/sq-al/search"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
