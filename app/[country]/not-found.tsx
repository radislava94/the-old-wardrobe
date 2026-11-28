import type { Metadata } from "next";
import { MissingPiece } from "@/components/missing-piece";

export const metadata: Metadata = {
  title: "This piece has left the wardrobe",
};

export default function NotFound() {
  return <MissingPiece />;
}
