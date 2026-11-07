import Link from "next/link";
import type { ReactNode } from "react";

export function JournalAnchor({
  href,
  children,
}: {
  href?: string;
  children?: ReactNode;
}) {
  if (!href) return <span>{children}</span>;
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return <a href={href}>{children}</a>;
}
