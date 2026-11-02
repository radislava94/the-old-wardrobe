import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LandingCopy } from "@/components/landing-copy";
import { ListingCard } from "@/components/listing-card";
import { PlaceLinks } from "@/components/place-links";
import { categoryFromSlug, categoryKeys, categorySlugs } from "@/lib/categories";
import { cardsFor } from "@/lib/cards";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { categoryCityPath, categoryPath, homePath } from "@/lib/paths";
import {
  absoluteUrl,
  categoryAlternatePaths,
  languageAlternates,
  pageMetadata,
} from "@/lib/seo";
import { seoChrome } from "@/lib/seo/chrome";
import { categoryLanding } from "@/lib/seo/copy";
import { inCity } from "@/lib/seo/listings";
import { citySlug } from "@/lib/seo/places";

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
  const copy = categoryLanding(raw, key);
  const dict = getDictionary(raw);
  return pageMetadata({
    title: copy.title,
    description: copy.description,
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
  const chrome = seoChrome[raw];
  const copy = categoryLanding(raw, key);
  const items = await listingsRepo.listByCategory(raw, key);
  const name = dict.categories[key];
  const cards = await cardsFor(items, raw, dict);
  const cityLinks = countries[raw].cities.flatMap((city) => {
    const citySlugValue = citySlug(raw, city);
    if (!citySlugValue) return [];
    return [
      {
        href: categoryCityPath(raw, key, citySlugValue),
        name: city,
        detail: dict.pieces(inCity(items, city).length),
      },
    ];
  });

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
        <LandingCopy copy={copy} />
        <PlaceLinks label={chrome.byCity} links={cityLinks} />
        <div className="sh">
          <div>
            <h2>{name}</h2>
            <p>
              {dict.pieces(items.length)} · {countries[raw].nativeName}
            </p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="placeholder-note">{dict.emptyCategory}</p>
        ) : (
          <>
            <div className="grid">
              {cards.map((card) => (
                <ListingCard key={card.href} {...card} />
              ))}
            </div>
            <p className="placeholder-note">{dict.placeholderNote}</p>
          </>
        )}
      </div>
    </section>
  );
}
