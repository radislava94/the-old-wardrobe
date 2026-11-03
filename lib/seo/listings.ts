import { listingsRepo } from "../data";
import type { CountryCode } from "../countries";
import type { CategoryKey, Listing } from "../types";

/** Listings already returned by the repository, narrowed to one city. */
export function inCity(items: readonly Listing[], city: string): Listing[] {
  return items.filter((item) => item.city === city);
}

/**
 * Category listings for one city. Uses `listByCategory` and keeps its
 * newest-first order. Does not add a repository method.
 */
export async function listingsForPlace(
  country: CountryCode,
  category: CategoryKey,
  city: string,
): Promise<Listing[]> {
  const items = await listingsRepo.listByCategory(country, category);
  return inCity(items, city);
}
