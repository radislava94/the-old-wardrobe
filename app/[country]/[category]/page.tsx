import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingCard } from "@/components/listing-card";
import { categoryFromSlug, categoryKeys, categorySlugs } from "@/lib/categories";
import { cardProps } from "@/lib/cards";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { categoryPath, homePath } from "@/lib/paths";
import {
  absoluteUrl,
  categoryAlternatePaths,
  languageAlternates,
  pageMetadata,
} from "@/lib/seo";
export function generateStaticParams() {
  return countryCodes.flatMap((country) =>
    categoryKeys.map((key) => ({
      country,
      category: categorySlugs[country][key],
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; category: string }>;
}): Promise<Metadata> {
  const { country: raw, category: slug } = await params;
  if (!isCountry(raw)) return {};
  const key = categoryFromSlug(raw, slug);
  if (!key) return {};
  const dict = getDictionary(raw);
  const name = dict.categories[key];
  return pageMetadata({
    title: dict.meta.categoryTitle(name),
    description: dict.meta.categoryDescription(name),
    canonicalPath: categoryPath(raw, key),
    languages: languageAlternates(categoryAlternatePaths(key), categoryPath("mk", key)),
    locale: countries[raw].ogLocale,
    image: {
      url: absoluteUrl(heroPhoto.src),
      alt: dict.hero.imageAlt,
      width: heroPhoto.width,
      height: heroPhoto.height,
    },
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ country: string; category: string }>;
}) {
  const { country: raw, category: slug } = await params;
  if (!isCountry(raw)) notFound();
  const key = categoryFromSlug(raw, slug);
  if (!key) notFound();
  const dict = getDictionary(raw);
  const items = await listingsRepo.listByCategory(raw, key);
  const name = dict.categories[key];

  return (
    <section className="finds page-block">
      <div className="wrap">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(raw) },
            { name, path: categoryPath(raw, key) },
          ]}
        />
        <div className="sh">
          <div>
            <h1>{name}</h1>
            <p>
              {dict.pieces(items.length)} · {countries[raw].nativeName}
            </p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="placeholder-note">{dict.emptyCategory}</p>
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
