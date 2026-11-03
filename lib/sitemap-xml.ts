import { categoryKeys } from "./categories";
import { listingsRepo } from "./data";
import { countries, countryCodes, type CountryCode } from "./countries";
import {
  absoluteUrl,
  categoryAlternatePaths,
  categoryCityAlternatePaths,
  homeAlternatePaths,
  languageAlternates,
  listingAlternatePaths,
  sellAlternatePaths,
  sellerAlternatePaths,
} from "./seo";
import {
  categoryCityPath,
  categoryPath,
  homePath,
  listingPath,
  sellerPath,
  sellPath,
} from "./paths";
import { citySlug } from "./seo/places";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(options: {
  path: string;
  languages: Record<string, string>;
  priority: number;
  lastmod?: string;
}): string {
  const links = Object.entries(options.languages)
    .map(
      ([lang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
    )
    .join("\n");
  const lastmod = options.lastmod ? `    <lastmod>${escapeXml(options.lastmod)}</lastmod>\n` : "";
  return `  <url>
    <loc>${escapeXml(absoluteUrl(options.path))}</loc>
${links}
${lastmod}    <changefreq>weekly</changefreq>
    <priority>${options.priority.toFixed(1)}</priority>
  </url>`;
}

export async function countrySitemapXml(country: CountryCode): Promise<string> {
  const items = await listingsRepo.listByCountry(country);
  const newest = items[0]?.createdAt;
  const entries: string[] = [];

  if (country === "mk") {
    entries.push(
      urlEntry({
        path: "/",
        languages: languageAlternates(homeAlternatePaths(), "/"),
        priority: 0.9,
        lastmod: newest,
      }),
    );
  }

  entries.push(
    urlEntry({
      path: homePath(country),
      languages: languageAlternates(homeAlternatePaths(), "/"),
      priority: 1,
      lastmod: newest,
    }),
  );

  for (const key of categoryKeys) {
    entries.push(
      urlEntry({
        path: categoryPath(country, key),
        languages: languageAlternates(
          categoryAlternatePaths(key),
          categoryPath("mk", key),
        ),
        priority: 0.8,
        lastmod: newest,
      }),
    );

    for (const city of countries[country].cities) {
      const slug = citySlug(country, city);
      if (!slug) continue;
      const path = categoryCityPath(country, key, slug);
      const newestHere = items.find(
        (item) => item.category === key && item.city === city,
      )?.createdAt;
      entries.push(
        urlEntry({
          path,
          languages: languageAlternates(
            categoryCityAlternatePaths(country, key, slug),
            path,
          ),
          priority: 0.7,
          lastmod: newestHere,
        }),
      );
    }
  }

  entries.push(
    urlEntry({
      path: sellPath(country),
      languages: languageAlternates(sellAlternatePaths(), sellPath("mk")),
      priority: 0.4,
    }),
  );

  const sellers = await listingsRepo.listSellers(country);
  for (const seller of sellers) {
    entries.push(
      urlEntry({
        path: sellerPath(country, seller.handle),
        languages: languageAlternates(
          sellerAlternatePaths(seller),
          sellerPath(country, seller.handle),
        ),
        priority: 0.5,
      }),
    );
  }

  for (const listing of items) {
    entries.push(
      urlEntry({
        path: listingPath(country, listing.slug),
        languages: languageAlternates(
          listingAlternatePaths(listing),
          listingPath(country, listing.slug),
        ),
        priority: listing.status === "sold" ? 0.4 : 0.6,
        lastmod: listing.createdAt,
      }),
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
}

export function sitemapIndexXml(): string {
  const body = [
    ...countryCodes.map(
      (code) => `  <sitemap>
    <loc>${escapeXml(absoluteUrl(`/sitemap/${code}.xml`))}</loc>
  </sitemap>`,
    ),
    ...countryCodes.map(
      (code) => `  <sitemap>
    <loc>${escapeXml(absoluteUrl(`/sitemap/blog/${code}.xml`))}</loc>
  </sitemap>`,
    ),
  ].join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}
