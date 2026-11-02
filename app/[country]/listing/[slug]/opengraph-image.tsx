import { ogSize } from "@/lib/og/card";
import { listingImageParams } from "@/lib/og/params";
import { renderListingOg } from "@/lib/og/render";

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
  return renderListingOg(country, slug);
}
