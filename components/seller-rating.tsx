import { Stars } from "@/components/stars";
import type { RatingSummary } from "@/lib/types";

/** Buyer ratings only. A seller with none yet gets a sentence, not a hidden row. */
export function SellerRating({
  summary,
  figure,
  label,
  emptyLabel,
  size = "sm",
}: {
  summary: RatingSummary;
  figure: string;
  label: string;
  emptyLabel: string;
  size?: "sm" | "lg";
}) {
  if (summary.count === 0) {
    return <span className={size === "lg" ? "new-seller new-seller-lg" : "new-seller"}>{emptyLabel}</span>;
  }
  return <Stars summary={summary} figure={figure} label={label} size={size} />;
}
