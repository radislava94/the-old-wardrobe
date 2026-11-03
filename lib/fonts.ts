import { Courier_Prime, Playfair_Display } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  fallback: ["Georgia", "Noto Serif", "Liberation Serif", "serif"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const courier = Courier_Prime({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-courier",
});

export const fontClassName = `${playfair.variable} ${courier.variable}`;
