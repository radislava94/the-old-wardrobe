"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCountry } from "@/lib/countries";
import { missingCopy } from "@/lib/suggestions";

export function MissingPiece() {
  const pathname = usePathname() || "/";
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const country = isCountry(segment) ? segment : null;
  const copy = country ? missingCopy[country] : null;

  return (
    <section className="missing wrap">
      <p className="eyebrow">404</p>
      <h1>{copy?.title ?? "This piece has left the wardrobe."}</h1>
      <p className="lead">
        {copy?.body ?? "The rail has been moved, or the link is old."}
      </p>
      <Link className="btn btn-primary" href={country ? `/${country}` : "/"}>
        {copy?.home ?? "Back to the door"}
      </Link>
    </section>
  );
}
