import Link from "next/link";
import { categoryKeys } from "@/lib/categories";
import type { CountryCode } from "@/lib/countries";
import type { Dictionary } from "@/lib/i18n";
import { categoryPath } from "@/lib/paths";
import type { CategoryKey } from "@/lib/types";

const tones: Record<CategoryKey, string> = {
  dresses: "rose",
  coats: "mustard",
  knitwear: "sage",
  denim: "blue",
  accessories: "rose",
};

export function CategoryRow({
  country,
  dict,
  counts,
}: {
  country: CountryCode;
  dict: Dictionary;
  counts: Record<CategoryKey, number>;
}) {
  return (
    <section className="cats" aria-label={dict.nav.browse}>
      <div className="wrap row">
        {categoryKeys.map((key) => (
          <Link key={key} className="cat" href={categoryPath(country, key)}>
            <span className={`ic tone-${tones[key]}`}>
              <CategoryGlyph kind={key} />
            </span>
            <span>{dict.categories[key]}</span>
            <small>{dict.pieces(counts[key])}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryGlyph({ kind }: { kind: CategoryKey }) {
  if (kind === "dresses") {
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#3b2f24" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 3h8l-1 6 6 18H7l6-18-1-6Z" />
        <path d="M13 9h6" />
      </svg>
    );
  }
  if (kind === "coats") {
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#3b2f24" strokeWidth="1.6" aria-hidden="true">
        <path d="M11 4 6 8v20h7V12M21 4l5 4v20h-7V12" />
        <path d="M11 4l5 8 5-8" />
        <circle cx="16" cy="18" r=".8" fill="#3b2f24" />
        <circle cx="16" cy="23" r=".8" fill="#3b2f24" />
      </svg>
    );
  }
  if (kind === "knitwear") {
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#3b2f24" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 5h8l7 5-3 5-3-2v14H11V13l-3 2-3-5 7-5Z" />
        <path d="M12 18l4 3 4-3M12 23l4 3 4-3" />
      </svg>
    );
  }
  if (kind === "denim") {
    return (
      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#3b2f24" strokeWidth="1.6" aria-hidden="true">
        <path d="M9 4h14l1 24h-6l-2-14-2 14H8L9 4Z" />
        <path d="M9 8h14M12 8v3M20 8v3" />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#3b2f24" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 12h20l-2 15H8L6 12Z" />
      <path d="M11 12a5 5 0 0 1 10 0" />
    </svg>
  );
}
