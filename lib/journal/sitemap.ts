import { countries, type CountryCode } from "../countries";
import { blogIndexPath, blogPath } from "../paths";
import { absoluteUrl } from "../seo";
import { equivalents, postsForCountry } from "./posts";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function linksFor(paths: { hreflang: string; path: string }[], xDefaultPath: string): string {
  const rows = [
    ["x-default", absoluteUrl(xDefaultPath)],
    ...paths.map((item) => [item.hreflang, absoluteUrl(item.path)]),
  ];
  return rows
    .map(
      ([lang, href]) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
    )
    .join("\n");
}

function urlEntry(path: string, alternateXml: string, priority: number, lastmod?: string): string {
  const last = lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>\n` : "";
  return `  <url>
    <loc>${escapeXml(absoluteUrl(path))}</loc>
${alternateXml}
${last}    <changefreq>monthly</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

export function blogSitemapXml(country: CountryCode): string {
  const posts = postsForCountry(country);
  const indexes = (["mk", "bg", "sr-rs", "sq-al"] as const).map((code) => ({
    hreflang: countries[code].hreflang,
    path: blogIndexPath(code),
  }));
  const entries = [
    urlEntry(
      blogIndexPath(country),
      linksFor(indexes, blogIndexPath("mk")),
      0.6,
      posts[0]?.published,
    ),
  ];

  for (const post of posts) {
    const twins = equivalents(post.topic);
    const alternates = twins.map((twin) => ({
      hreflang: countries[twin.country].hreflang,
      path: blogPath(twin.country, twin.slug),
    }));
    const xDefault = twins.find((twin) => twin.country === "mk") ?? post;
    entries.push(
      urlEntry(
        blogPath(country, post.slug),
        linksFor(alternates, blogPath(xDefault.country, xDefault.slug)),
        0.5,
        post.published,
      ),
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
}
