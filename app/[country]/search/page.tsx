import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { cardProps } from "@/lib/cards";
import { countries, countryCodes, isCountry, type CountryCode } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { searchPath } from "@/lib/paths";
import { absoluteUrl, languageAlternates, pageMetadata } from "@/lib/seo";
import type { Listing } from "@/lib/types";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { country: raw } = await params;
  const { q } = await searchParams;
  if (!isCountry(raw)) return {};
  const dict = getDictionary(raw);
  const query = q?.trim() ?? "";
  const paths = Object.fromEntries(
    countryCodes.map((code) => [
      code,
      query ? `${searchPath(code)}?q=${encodeURIComponent(query)}` : searchPath(code),
    ]),
  ) as Record<CountryCode, string>;
  return pageMetadata({
    title: dict.meta.searchTitle(query),
    description: dict.meta.searchDescription,
    canonicalPath: paths[raw],
    languages: languageAlternates(paths, paths.mk),
    locale: countries[raw].ogLocale,
    noIndex: true,
    image: {
      url: absoluteUrl(heroPhoto.src),
      alt: dict.hero.imageAlt,
      width: heroPhoto.width,
      height: heroPhoto.height,
    },
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { country: raw } = await params;
  const { q } = await searchParams;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const query = q?.trim() ?? "";
  const fromRepo = await listingsRepo.search(raw, query);
  let items: Listing[] = fromRepo;
  if (query) {
    const needle = query.toLowerCase();
    const all = await listingsRepo.listByCountry(raw);
    const byCategory = all.filter((item) =>
      dict.categories[item.category].toLowerCase().includes(needle),
    );
    const seen = new Set(items.map((item) => item.id));
    items = [...items, ...byCategory.filter((item) => !seen.has(item.id))];
  }

  return (
    <section className="finds page-block">
      <div className="wrap">
        <div className="sh">
          <div>
            <h1>{query ? dict.meta.searchTitle(query) : dict.search.allTitle}</h1>
            <p>{dict.search.count(items.length)}</p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="placeholder-note">{dict.search.empty}</p>
        ) : (
          <div className="grid">
            {items.map((listing, index) => (
              <ListingCard key={listing.id} {...cardProps(listing, index, raw, dict)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
