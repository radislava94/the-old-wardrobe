import type { Metadata } from "next";
import { categoryPath, homePath, listingPath, sellerPath, sellPath } from "./paths";
import { countries, countryCodes, type CountryCode } from "./countries";
import { siteUrl } from "./site";
import type { CategoryKey, Listing, RatingSummary, User } from "./types";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalized}`;
}

export function languageAlternates(
  paths: Record<CountryCode, string>,
  xDefaultPath: string,
): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(xDefaultPath),
  };
  for (const code of countryCodes) {
    languages[countries[code].hreflang] = absoluteUrl(paths[code]);
  }
  return languages;
}

export function homeAlternatePaths(): Record<CountryCode, string> {
  return Object.fromEntries(
    countryCodes.map((code) => [code, homePath(code)]),
  ) as Record<CountryCode, string>;
}

export function categoryAlternatePaths(
  key: CategoryKey,
): Record<CountryCode, string> {
  return Object.fromEntries(
    countryCodes.map((code) => [code, categoryPath(code, key)]),
  ) as Record<CountryCode, string>;
}

export function sellAlternatePaths(): Record<CountryCode, string> {
  return Object.fromEntries(
    countryCodes.map((code) => [code, sellPath(code)]),
  ) as Record<CountryCode, string>;
}

/**
 * A garment is listed in one country only. Its own locale (and x-default)
 * point at the listing. The other three locales point at the same category
 * in that country — an indexable, localized page — because there is no
 * translated copy of this piece.
 */
export function listingAlternatePaths(
  listing: Listing,
): Record<CountryCode, string> {
  return Object.fromEntries(
    countryCodes.map((code) => [
      code,
      code === listing.country
        ? listingPath(code, listing.slug)
        : categoryPath(code, listing.category),
    ]),
  ) as Record<CountryCode, string>;
}

/**
 * A person sells in one country. Their own locale and x-default point
 * at the profile. The other three locales point at that country's home,
 * because this seller is not listed there.
 */
export function sellerAlternatePaths(user: User): Record<CountryCode, string> {
  return Object.fromEntries(
    countryCodes.map((code) => [
      code,
      code === user.country ? sellerPath(code, user.handle) : homePath(code),
    ]),
  ) as Record<CountryCode, string>;
}

export function pageMetadata(options: {
  title: string;
  description: string;
  canonicalPath: string;
  languages: Record<string, string>;
  locale: string;
  image?: { url: string; alt: string; width: number; height: number };
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(options.canonicalPath);
  const images = options.image
    ? [
        {
          url: options.image.url,
          alt: options.image.alt,
          width: options.image.width,
          height: options.image.height,
        },
      ]
    : undefined;

  const fullTitle = `${options.title} · The Old Wardrobe`;
  return {
    title: { absolute: fullTitle },
    description: options.description,
    alternates: {
      canonical,
      languages: options.languages,
    },
    openGraph: {
      title: fullTitle,
      description: options.description,
      url: canonical,
      siteName: "The Old Wardrobe",
      locale: options.locale,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: options.description,
      images: images?.map((image) => image.url),
    },
    robots: options.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  const origin = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "The Old Wardrobe",
        url: origin,
        logo: `${origin}/brand/mark.svg`,
        email: "hello@theoldwardrobe.example",
        description:
          "A secondhand clothes marketplace for the Balkans. Pieces are listed per country, in the local language and currency.",
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: "The Old Wardrobe",
        url: origin,
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: ["mk-MK", "bg-BG", "sr-RS", "sq-AL"],
      },
    ],
  };
}

export function articleJsonLd(options: {
  title: string;
  description: string;
  path: string;
  published: string;
  imageUrl: string;
  inLanguage: string;
}) {
  const origin = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    datePublished: options.published,
    inLanguage: options.inLanguage,
    image: [options.imageUrl],
    mainEntityOfPage: absoluteUrl(options.path),
    author: { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Product/Offer only. Seller reviews are about the person, not the garment,
 * so this object must not grow an aggregateRating.
 */
export function productJsonLd(options: {
  listing: Listing;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  path: string;
}) {
  const { listing, price, currency, imageUrl, path, description } = options;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description,
    image: [imageUrl],
    sku: listing.id,
    category: listing.category,
    ...(listing.brand
      ? { brand: { "@type": "Brand", name: listing.brand } }
      : {}),
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      priceCurrency: currency,
      price: String(price),
      availability:
        listing.status === "sold"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      areaServed: countries[listing.country].name,
    },
  };
}

/**
 * Person markup for a seller profile.
 *
 * Google's review-snippet guidelines allow aggregateRating only when the
 * ratings were collected by this site from real users, about this person,
 * and are visible on the page. Sample reviews are not first-party, so
 * `firstParty` must be false for them and the field is left out.
 */
export function sellerJsonLd(options: {
  user: User;
  path: string;
  summary: RatingSummary;
  firstParty: boolean;
}) {
  const country = countries[options.user.country];
  const person: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: options.user.name,
    url: absoluteUrl(options.path),
    description: options.user.bio,
    homeLocation: {
      "@type": "Place",
      name: options.user.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: options.user.city,
        addressCountry: country.name,
      },
    },
    memberOf: { "@id": `${siteUrl()}/#organization` },
  };

  if (options.firstParty && options.summary.count > 0) {
    person.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.summary.average.toFixed(1),
      reviewCount: String(options.summary.count),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return person;
}
