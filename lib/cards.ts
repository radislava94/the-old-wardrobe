import { photos } from "./photos";
import { priceFor } from "./money";
import { listingPath, sellerPath } from "./paths";
import { countries, type CountryCode } from "./countries";
import { listingsRepo, reviewsRepo } from "./data";
import type { Dictionary } from "./i18n";
import { emptySummary, formatRating } from "./ratings";
import type { Listing, User } from "./types";

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

export async function cardsFor(items: Listing[], country: CountryCode, dict: Dictionary) {
  const sellerIds = [...new Set(items.map((item) => item.sellerId))];
  const [summaries, sellers] = await Promise.all([
    reviewsRepo.summariesFor(sellerIds),
    Promise.all(sellerIds.map((id) => listingsRepo.getUser(id))),
  ]);
  const byId = new Map(
    sellers.filter((user): user is User => user !== null).map((user) => [user.id, user]),
  );
  const locale = countries[country].intlLocale;

  return items.map((listing, index) => {
    const seller = byId.get(listing.sellerId);
    const summary = summaries[listing.sellerId] ?? emptySummary();
    const figure = summary.count ? formatRating(summary.average, locale) : "";
    return {
      ...cardProps(listing, index, country, dict),
      sellerName: seller?.name ?? "",
      sellerHref: seller ? sellerPath(country, seller.handle) : `/${country}`,
      summary,
      ratingLabel: summary.count
        ? dict.rating.aria(figure, dict.rating.count(summary.count))
        : dict.rating.noReviews,
      ratingFigure: figure,
    };
  });
}
