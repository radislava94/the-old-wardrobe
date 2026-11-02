import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LandingCopy } from "@/components/landing-copy";
import { ListingCard } from "@/components/listing-card";
import { PlaceLinks } from "@/components/place-links";
import { categoryFromSlug, categoryKeys, categorySlug } from "@/lib/categories";
import { cardsFor } from "@/lib/cards";
import { countries, countryCodes, isCountry, type CountryCode } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto, photos } from "@/lib/photos";
import { categoryCityPath, categoryPath, homePath } from "@/lib/paths";
import {
  absoluteUrl,
  categoryCityAlternatePaths,
  languageAlternates,
  pageMetadata,
} from "@/lib/seo";
import { seoChrome } from "@/lib/seo/chrome";
import { cityLanding } from "@/lib/seo/copy";
import { listingsForPlace } from "@/lib/seo/listings";
import { cityFromSlug, citySlug } from "@/lib/seo/places";
import type { CategoryKey } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return countryCodes.flatMap((country) =>
    categoryKeys.flatMap((key) =>
      countries[country].cities.flatMap((city) => {
        const slug = citySlug(country, city);
        if (!slug) return [];
        return [
          {
            country,
            category: categorySlug(country, key),
            city: slug,
          },
        ];
      }),
    ),
  );
}

function resolve(raw: {
  country: string;
  category: string;
  city: string;
}): { country: CountryCode; key: CategoryKey; city: string; slug: string } | null {
  if (!isCountry(raw.country)) return null;
  const key = categoryFromSlug(raw.country, raw.category);
  if (!key) return null;
  const city = cityFromSlug(raw.country, raw.city);
  if (!city) return null;
  return { country: raw.country, key, city, slug: raw.city };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; category: string; city: string }>;
}): Promise<Metadata> {
  const resolved = resolve(await params);
  if (!resolved) return {};
  const copy = cityLanding(resolved.country, resolved.key, resolved.city);
  const dict = getDictionary(resolved.country);
  const items = await listingsForPlace(resolved.country, resolved.key, resolved.city);
  const listed = items[0];
  const photo = listed ? photos[listed.photo] : heroPhoto;
  const path = categoryCityPath(resolved.country, resolved.key, resolved.slug);
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    canonicalPath: path,
    languages: languageAlternates(
      categoryCityAlternatePaths(resolved.country, resolved.key, resolved.slug),
      path,
    ),
    locale: countries[resolved.country].ogLocale,
    image: {
      url: absoluteUrl(photo.src),
      alt: listed?.title ?? dict.hero.imageAlt,
      width: photo.width,
      height: photo.height,
    },
  });
}

export default async function CategoryCityPage({
  params,
}: {
  params: Promise<{ country: string; category: string; city: string }>;
}) {
  const resolved = resolve(await params);
  if (!resolved) notFound();
  const { country, key, city, slug } = resolved;
  const dict = getDictionary(country);
  const chrome = seoChrome[country];
  const copy = cityLanding(country, key, city);
  const name = dict.categories[key];
  const otherCities = countries[country].cities.filter((candidate) => candidate !== city);
  const otherKeys = categoryKeys.filter((candidate) => candidate !== key);

  const [items, otherCityLists, siblingLists] = await Promise.all([
    listingsForPlace(country, key, city),
    Promise.all(
      otherCities.map(async (candidate) => ({
        city: candidate,
        items: await listingsForPlace(country, key, candidate),
      })),
    ),
    Promise.all(
      otherKeys.map(async (candidate) => ({
        key: candidate,
        items: await listingsForPlace(country, candidate, city),
      })),
    ),
  ]);
  const cards = await cardsFor(items, country, dict);

  const otherCityLinks = otherCityLists.flatMap((entry) => {
    const entrySlug = citySlug(country, entry.city);
    if (!entrySlug) return [];
    return [
      {
        href: categoryCityPath(country, key, entrySlug),
        name: entry.city,
        detail: dict.pieces(entry.items.length),
      },
    ];
  });

  const sameCityLinks = siblingLists.map((entry) => ({
    href: categoryCityPath(country, entry.key, slug),
    name: dict.categories[entry.key],
    detail: dict.pieces(entry.items.length),
  }));

  return (
    <section className="finds page-block">
      <div className="wrap">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(country) },
            { name, path: categoryPath(country, key) },
            { name: city, path: categoryCityPath(country, key, slug) },
          ]}
        />
        <LandingCopy copy={copy} />
        <div className="sh">
          <p>
            {dict.pieces(items.length)} · {city}
          </p>
          <Link href={categoryPath(country, key)}>{chrome.wholeRail} →</Link>
        </div>
        {items.length === 0 ? (
          <p className="placeholder-note">{chrome.emptyRail}</p>
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
        <PlaceLinks label={chrome.otherCity} links={otherCityLinks} />
        <PlaceLinks label={chrome.sameCity} links={sameCityLinks} />
      </div>
    </section>
  );
}
