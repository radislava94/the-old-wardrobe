import { photos } from "./photos";
import { priceFor } from "./money";
import { listingPath } from "./paths";
import type { CountryCode } from "./countries";
import type { Dictionary } from "./i18n";
import type { Listing } from "./types";

const rotations = ["-1.5deg", "1deg", "-0.8deg", "1.4deg", "-1deg", "0.8deg", "-1.2deg", "1.2deg"];

export function cardProps(listing: Listing, index: number, country: CountryCode, dict: Dictionary) {
  return {
    href: listingPath(listing.country, listing.slug),
    title: listing.title,
    era: listing.era,
    price: priceFor(listing, country).formatted,
    sizeLabel: dict.sizeTag(listing.size),
    sold: listing.status === "sold",
    soldLabel: dict.sold,
    soldSmall: dict.soldSmall,
    rotation: rotations[index % rotations.length] ?? "0deg",
    image: photos[listing.photo],
  };
}
