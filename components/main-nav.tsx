"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CountryCode } from "@/lib/countries";
import { blogIndexPath, homePath, sellPath } from "@/lib/paths";

export function MainNav({
  country,
  label,
  browse,
  journal,
  sell,
  about,
}: {
  country: CountryCode;
  label: string;
  browse: string;
  journal: string;
  sell: string;
  about: string;
}) {
  const pathname = usePathname() || homePath(country);
  const journalHome = blogIndexPath(country);
  const onJournal = pathname === journalHome || pathname.startsWith(`${journalHome}/`);
  const onSell = pathname === sellPath(country);
  const onBrowse = !onSell && !onJournal;
  return (
    <nav className="links" aria-label={label}>
      <Link href={homePath(country)} className={onBrowse ? "active" : undefined} aria-current={onBrowse ? "page" : undefined}>
        {browse}
      </Link>
      <Link href={journalHome} className={onJournal ? "active" : undefined} aria-current={onJournal ? "page" : undefined}>
        {journal}
      </Link>
      <Link href={sellPath(country)} className={onSell ? "active" : undefined} aria-current={onSell ? "page" : undefined}>
        {sell}
      </Link>
      <Link href={`${homePath(country)}#story`}>{about}</Link>
    </nav>
  );
}
