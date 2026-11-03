"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { countries, type CountryCode } from "@/lib/countries";
import { suggestions } from "@/lib/suggestions";

function matchLanguage(languages: readonly string[]): CountryCode | null {
  for (const raw of languages) {
    const tag = raw.toLowerCase();
    if (tag.startsWith("mk")) return "mk";
    if (tag.startsWith("bg")) return "bg";
    if (tag.startsWith("sr")) return "sr-rs";
    if (tag.startsWith("sq")) return "sq-al";
  }
  return null;
}

/** Suggests a country from the browser language. Never reads an IP address. */
export function SuggestBanner({ label }: { label: string }) {
  const [code, setCode] = useState<CountryCode | null>(null);

  useEffect(() => {
    const languages =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language];
    setCode(matchLanguage(languages));
  }, []);

  if (!code) return null;
  const country = countries[code];
  const copy = suggestions[code];

  return (
    <aside className="suggest" lang={country.htmlLang} aria-label={label}>
      <p>{copy.text}</p>
      <Link href={`/${code}`} hrefLang={country.hreflang}>
        {copy.cta}
      </Link>
    </aside>
  );
}
