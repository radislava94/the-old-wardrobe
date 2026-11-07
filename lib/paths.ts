import { categorySlug } from "./categories";
import type { CountryCode } from "./countries";
import type { CategoryKey } from "./types";

export function homePath(country: CountryCode): string {
  return `/${country}`;
}

export function categoryPath(country: CountryCode, key: CategoryKey): string {
  return `/${country}/${categorySlug(country, key)}`;
}

export function listingPath(country: CountryCode, slug: string): string {
  return `/${country}/listing/${slug}`;
}

export function sellPath(country: CountryCode): string {
  return `/${country}/sell`;
}

export function searchPath(country: CountryCode): string {
  return `/${country}/search`;
}

export function sellerPath(country: CountryCode, handle: string): string {
  return `/${country}/seller/${handle}`;
}

export function blogIndexPath(country: CountryCode): string {
  return `/${country}/blog`;
}

export function blogPath(country: CountryCode, slug: string): string {
  return `/${country}/blog/${slug}`;
}
