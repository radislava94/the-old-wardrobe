import { useId } from "react";
import { starFill } from "@/lib/ratings";
import type { RatingSummary } from "@/lib/types";

const STAR =
  "M12 2.2l2.7 5.6 6.2.8-4.6 4.3 1.2 6.2L12 16.3 6.5 19.1l1.2-6.2L3.1 8.6l6.2-.8L12 2.2z";

export function Stars({
  summary,
  label,
  figure,
  size = "sm",
  compact = false,
}: {
  summary: RatingSummary;
  label: string;
  figure: string;
  size?: "sm" | "lg";
  compact?: boolean;
}) {
  const rawId = useId().replace(/:/g, "");
  const fill = starFill(summary);
  const px = size === "lg" ? 22 : 14;

  return (
    <span className={`rating rating-${size}`} aria-label={label}>
      <svg
        className="star-row"
        viewBox="0 0 120 24"
        width={px * 5.6}
        height={px}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={rawId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#c9a14a" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }, (_, index) => {
          const state = fill >= index + 1 ? "full" : fill >= index + 0.5 ? "half" : "empty";
          return (
            <path
              key={index}
              d={STAR}
              transform={`translate(${index * 24} 0)`}
              fill={state === "full" ? "#c9a14a" : state === "half" ? `url(#${rawId})` : "transparent"}
              stroke="#8a6424"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      {!compact && summary.count > 0 ? (
        <span className="rating-figure" aria-hidden="true">
          {figure}
          <span className="rating-count"> ({summary.count})</span>
        </span>
      ) : null}
    </span>
  );
}
