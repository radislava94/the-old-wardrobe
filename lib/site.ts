/** Placeholder inbox. Nothing is delivered here yet. */
export const CONTACT_EMAIL = "hello@theoldwardrobe.example";

/**
 * Absolute origin for canonical URLs, hreflang, sitemaps, and JSON-LD.
 *
 * Set `NEXT_PUBLIC_SITE_URL` to the public domain (no trailing slash)
 * before launch. Without it, production on Vercel uses the production
 * host, other Vercel deployments use their own host, and local builds
 * use http://localhost:3000.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const withProtocol = /^https?:\/\//.test(explicit)
      ? explicit
      : `https://${explicit}`;
    return withProtocol.replace(/\/$/, "");
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelEnv === "production" && productionHost) {
    return `https://${host(productionHost)}`;
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) return `https://${host(vercelHost)}`;

  return "http://localhost:3000";
}

function host(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
