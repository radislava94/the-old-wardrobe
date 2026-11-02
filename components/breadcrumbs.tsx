import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function Breadcrumbs({
  label,
  items,
}: {
  label: string;
  items: { name: string; path: string }[];
}) {
  return (
    <>
      <nav className="crumbs" aria-label={label}>
        <ol>
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.path}-${item.name}`}>
                {last ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.path}>{item.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
