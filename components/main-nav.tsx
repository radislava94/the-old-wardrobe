"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CountryCode } from "@/lib/countries";
import { homePath, sellPath } from "@/lib/paths";

export function MainNav({
  country,
  label,
  browse,
  sell,
  about,
}: {
  country: CountryCode;
  label: string;
  browse: string;
  sell: string;
  about: string;
}) {
  const pathname = usePathname() || homePath(country);
  const onSell = pathname === sellPath(country);
  return (
    <nav className="links" aria-label={label}>
      <Link href={homePath(country)} className={onSell ? undefined : "active"} aria-current={onSell ? undefined : "page"}>
        {browse}
      </Link>
      <Link href={sellPath(country)} className={onSell ? "active" : undefined} aria-current={onSell ? "page" : undefined}>
        {sell}
      </Link>
      <Link href={`${homePath(country)}#story`}>{about}</Link>
    </nav>
  );
}
