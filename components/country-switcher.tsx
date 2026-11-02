"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryFromSlug } from "@/lib/categories";
import { countries, countryCodes, type CountryCode } from "@/lib/countries";
import { categoryPath, homePath, searchPath, sellPath } from "@/lib/paths";

export function CountrySwitcher({
  country,
  label,
  allLabel,
}: {
  country: CountryCode;
  label: string;
  allLabel: string;
}) {
  const pathname = usePathname() || `/${country}`;
  const rest = pathname.split("/").filter(Boolean).slice(1);

  function hrefFor(target: CountryCode): string {
    if (rest.length === 0) return homePath(target);
    if (rest[0] === "sell") return sellPath(target);
    if (rest[0] === "search") return searchPath(target);
    if (rest[0] === "listing") return homePath(target);
    const key = categoryFromSlug(country, rest[0] ?? "");
    if (key) return categoryPath(target, key);
    return homePath(target);
  }

  return (
    <nav className="switcher" aria-label={label}>
      {countryCodes.map((code) => {
        const current = code === country;
        return (
          <Link
            key={code}
            href={hrefFor(code)}
            hrefLang={countries[code].hreflang}
            lang={countries[code].htmlLang}
            aria-current={current ? "true" : undefined}
            title={countries[code].nativeName}
          >
            {countries[code].short}
          </Link>
        );
      })}
      <Link href="/" hrefLang="x-default">
        {allLabel}
      </Link>
    </nav>
  );
}
