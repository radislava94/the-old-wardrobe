import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { isCountry, type CountryCode } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import type { CurrencyCode } from "@/lib/types";
import { ListingOgCard, ogSize } from "./card";
import { loadOgFonts } from "./fonts";
import { listingPhotoDataUrl } from "./photo";

const currencyHome: Record<CurrencyCode, CountryCode> = {
  MKD: "mk",
  EUR: "bg",
  RSD: "sr-rs",
  ALL: "sq-al",
};

export type OgCardProps = {
  title: string;
  price: string | null;
  city: string | null;
  photo: string | null;
  soldLabel: string | null;
};

/** The one Polaroid renderer. Listing and journal images both call this. */
export async function renderOgImage(card: OgCardProps) {
  const fonts = await loadOgFonts();
  return new ImageResponse(<ListingOgCard {...card} />, {
    ...ogSize,
    fonts,
  });
}

export async function renderListingOg(raw: string, slug: string) {
  if (!isCountry(raw)) notFound();
  const listing = await listingsRepo.getBySlug(raw, slug);
  if (!listing) notFound();

  const dict = getDictionary(listing.country);
  const photo = await listingPhotoDataUrl(listing.photo);

  return renderOgImage({
    title: listing.title,
    price: formatMoney(listing.priceAmount, currencyHome[listing.currency]),
    city: listing.city,
    photo,
    soldLabel: listing.status === "sold" ? dict.sold : null,
  });
}
