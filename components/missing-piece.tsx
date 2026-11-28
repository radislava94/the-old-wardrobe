"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocumentTitle } from "@/components/document-title";
import { isCountry } from "@/lib/countries";
import { missingCopy } from "@/lib/suggestions";

export function MissingPiece() {
  const pathname = usePathname() || "/";
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const country = isCountry(segment) ? segment : null;
  const copy = country ? missingCopy[country] : null;
  const title = copy?.title ?? "This piece has left the wardrobe.";

  return (
    <section className="missing wrap">
      <DocumentTitle title={`${title} · The Old Wardrobe`} />
      <p className="eyebrow">404</p>
      <h1>{title}</h1>
      <p className="lead">
        {copy?.body ?? "The rail has been moved, or the link is old."}
      </p>
      <Link className="btn btn-primary" href={country ? `/${country}` : "/"}>
        {copy?.home ?? "Back to the door"}
      </Link>
    </section>
  );
}
