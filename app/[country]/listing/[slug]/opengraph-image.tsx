import { notFound } from "next/navigation";
import { isCountry } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { formatListingPrice } from "@/lib/money";
import { ogSize } from "@/lib/og/card";
import { listingImageParams } from "@/lib/og/params";
import { listingPhotoDataUrl } from "@/lib/og/photo";
import { renderOgImage } from "@/lib/og/render";

export const runtime = "nodejs";
export const alt = "The Old Wardrobe";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return listingImageParams();
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  if (!isCountry(country)) notFound();
  const listing = await listingsRepo.getBySlug(country, slug);
  if (!listing) notFound();

  const dict = getDictionary(listing.country);
  const photo = await listingPhotoDataUrl(listing.photo);

  return renderOgImage({
    title: listing.title,
    price: formatListingPrice(listing.priceAmount, listing.currency),
    city: listing.city,
    photo,
    soldLabel: listing.status === "sold" ? dict.sold : null,
  });
}
