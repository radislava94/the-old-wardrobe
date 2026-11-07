import { ImageResponse } from "next/og";
import { ListingOgCard, ogSize } from "./card";
import { loadOgFonts } from "./fonts";

export type OgCardProps = {
  title: string;
  price: string | null;
  city: string | null;
  photo: string | null;
  soldLabel: string | null;
};

/** The Polaroid card. Journal images call this; there is no second layout. */
export async function renderOgImage(card: OgCardProps) {
  const fonts = await loadOgFonts();
  return new ImageResponse(<ListingOgCard {...card} />, {
    ...ogSize,
    fonts,
  });
}
