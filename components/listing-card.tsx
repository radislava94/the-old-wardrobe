import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { RatingSummary } from "@/lib/types";
import { Stars } from "./stars";

export function ListingCard({
  href,
  title,
  era,
  price,
  sizeLabel,
  sold,
  soldLabel,
  soldSmall,
  rotation,
  image,
  sellerName,
  sellerHref,
  summary,
  ratingLabel,
  ratingFigure,
}: {
  href: string;
  title: string;
  era: string;
  price: string;
  sizeLabel: string;
  sold: boolean;
  soldLabel: string;
  soldSmall: string;
  rotation: string;
  image: StaticImageData;
  sellerName: string;
  sellerHref: string;
  summary: RatingSummary;
  ratingLabel: string;
  ratingFigure: string;
}) {
  return (
    <article className={sold ? "card sold" : "card"} style={{ ["--r" as string]: rotation }}>
      <Link href={href} className="card-link">
        <span className="size">{sizeLabel}</span>
        <span className="heart" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a2423a" strokeWidth="2">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
          </svg>
        </span>
        <div className="ph">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 760px) 46vw, (max-width: 1100px) 30vw, 250px"
          />
          {sold ? (
            <span className="stamp">
              {soldLabel}
              <small>{soldSmall}</small>
            </span>
          ) : null}
        </div>
        <div className="meta">
          <div>
            <h3>{title}</h3>
            <p className="era">{era}</p>
          </div>
          <span className="price">{price}</span>
        </div>
      </Link>
      <Link href={sellerHref} className="card-seller">
        <span>{sellerName}</span>
        <Stars summary={summary} label={ratingLabel} figure={ratingFigure} />
      </Link>
    </article>
  );
}
