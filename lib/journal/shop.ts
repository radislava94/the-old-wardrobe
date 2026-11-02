import { listingsRepo } from "../data";
import type { CountryCode } from "../countries";
import type { CategoryKey, Listing } from "../types";

/**
 * Live listings for a journal "shop this look" block.
 * Categories come from the post. Cities narrow the result.
 * An empty list means the block stays empty.
 */
export async function shopListings(
  country: CountryCode,
  categories: readonly CategoryKey[],
  cities: readonly string[],
): Promise<Listing[]> {
  if (categories.length === 0) return [];
  const groups = await Promise.all(
    categories.map((category) => listingsRepo.listByCategory(country, category)),
  );
  const citySet = new Set(cities);
  const seen = new Set<string>();
  const items: Listing[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (!citySet.has(item.city) || seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
      if (items.length === 4) return items;
    }
  }
  return items;
}
