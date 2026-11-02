import { listings } from "@/lib/data/catalog";

export function listingImageParams() {
  return listings.map((listing) => ({
    country: listing.country,
    slug: listing.slug,
  }));
}
