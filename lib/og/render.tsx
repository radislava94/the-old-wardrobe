import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { isCountry } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { formatListingPrice } from "@/lib/money";
import { ListingOgCard, ogSize } from "./card";
import { loadOgFonts } from "./fonts";
import { listingPhotoDataUrl } from "./photo";

export async function renderListingOg(raw: string, slug: string) {
  if (!isCountry(raw)) notFound();
  const listing = await listingsRepo.getBySlug(raw, slug);
  if (!listing) notFound();

  const dict = getDictionary(listing.country);
  const [fonts, photo] = await Promise.all([
    loadOgFonts(),
    listingPhotoDataUrl(listing.photo),
  ]);

  return new ImageResponse(
    (
      <ListingOgCard
        title={listing.title}
        price={formatListingPrice(listing.priceAmount, listing.currency)}
        city={listing.city}
        photo={photo}
        soldLabel={listing.status === "sold" ? dict.sold : null}
      />
    ),
    {
      ...ogSize,
      fonts,
    },
  );
}
