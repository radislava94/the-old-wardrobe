import { notFound } from "next/navigation";
import { countries } from "@/lib/countries";
import { journalCountry, postBySlug } from "@/lib/journal/posts";
import { ogSize } from "@/lib/og/card";
import { renderOgImage } from "@/lib/og/render";

export const runtime = "nodejs";
export const alt = "The Old Wardrobe";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  const code = journalCountry(country);
  if (!code) notFound();
  const post = postBySlug(code, slug);
  if (!post) notFound();

  return renderOgImage({
    title: post.title,
    price: null,
    city: countries[code].nativeName,
    photo: null,
    soldLabel: null,
  });
}
