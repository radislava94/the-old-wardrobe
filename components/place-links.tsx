import Link from "next/link";

export function PlaceLinks({
  label,
  links,
}: {
  label: string;
  links: { href: string; name: string; detail: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <nav className="place-nav" aria-label={label}>
      <h2>{label}</h2>
      <ul className="place-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>
              <span>{link.name}</span>
              <small>{link.detail}</small>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
