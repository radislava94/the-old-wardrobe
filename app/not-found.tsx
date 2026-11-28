import type { Metadata } from "next";
import { MissingDocument } from "@/components/missing-document";
import "./globals.css";

export const metadata: Metadata = {
  title: "This piece has left the wardrobe · The Old Wardrobe",
  description: "That page is not on the rail.",
};

/**
 * Unknown first segments still match `app/[country]`, and that root layout
 * calls `notFound()`. This file is what that call renders. `global-not-found`
 * only covers URLs that match no route at all.
 */
export default function NotFound() {
  return <MissingDocument />;
}
