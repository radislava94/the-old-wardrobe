import type { Listing } from "../types";

export function byNewest(a: Listing, b: Listing): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/** Same matching rules as the original in-memory search. */
export function searchListings(items: Listing[], query: string): Listing[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((listing) => {
    const haystack = [
      listing.title,
      listing.description,
      listing.city,
      listing.era,
      listing.condition,
      listing.size,
      listing.brand ?? "",
      listing.category,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
