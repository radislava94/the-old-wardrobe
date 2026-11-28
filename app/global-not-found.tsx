import type { Metadata } from "next";
import { MissingDocument } from "@/components/missing-document";
import "./globals.css";

export const metadata: Metadata = {
  title: "This piece has left the wardrobe · The Old Wardrobe",
  description: "That page is not on the rail.",
};

export default function GlobalNotFound() {
  return <MissingDocument />;
}
