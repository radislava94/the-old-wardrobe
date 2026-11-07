"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryFromSlug } from "@/lib/categories";
import { countries, countryCodes, type CountryCode } from "@/lib/countries";
import { journalChrome } from "@/lib/journal/chrome";
import { blogIndexPath, blogPath, categoryPath, homePath, searchPath, sellPath } from "@/lib/paths";

export function CountrySwitcher({
  country,
  label,
  allLabel,
  blogTwins,
}: {
  country: CountryCode;
  label: string;
  allLabel: string;
  /** `${country}:${slug}` → other locale slug. Missing key means no twin. */
  blogTwins: Record<string, Partial<Record<CountryCode, string>>>;
}) {
  const pathname = usePathname() || `/${country}`;
  const rest = pathname.split("/").filter(Boolean).slice(1);

  function destination(target: CountryCode): { href: string; indexFallback: boolean } {
    if (rest.length === 0) return { href: homePath(target), indexFallback: false };
    if (rest[0] === "sell") return { href: sellPath(target), indexFallback: false };
    if (rest[0] === "search") return { href: searchPath(target), indexFallback: false };
    if (rest[0] === "listing") return { href: homePath(target), indexFallback: false };
    if (rest[0] === "blog") {
      const article = rest[1];
      if (!article) return { href: blogIndexPath(target), indexFallback: false };
      const twin = blogTwins[`${country}:${article}`]?.[target];
      if (twin) return { href: blogPath(target, twin), indexFallback: false };
      return { href: blogIndexPath(target), indexFallback: true };
    }
    const key = categoryFromSlug(country, rest[0] ?? "");
    if (key) return { href: categoryPath(target, key), indexFallback: false };
    return { href: homePath(target), indexFallback: false };
  }

  return (
    <nav className="switcher" aria-label={label}>
      {countryCodes.map((code) => {
        const current = code === country;
        const { href, indexFallback } = destination(code);
        const language = countries[code].languageName;
        const accessibleName = indexFallback
          ? `${language}. ${journalChrome[code].fallbackName}`
          : language;
        return (
          <Link
            key={code}
            href={href}
            hrefLang={countries[code].hreflang}
            lang={countries[code].htmlLang}
            aria-current={current ? "true" : undefined}
            aria-label={accessibleName}
            title={countries[code].nativeName}
          >
            {countries[code].short}
          </Link>
        );
      })}
      <Link href="/" hrefLang="x-default" aria-label={allLabel}>
        {allLabel}
      </Link>
    </nav>
  );
}
