import type { Metadata } from "next";
import Link from "next/link";
import { fontClassName } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "This piece has left the wardrobe · The Old Wardrobe",
  description: "That page is not on the rail.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontClassName}>
      <body>
        <main className="missing wrap">
          <p className="eyebrow">404</p>
          <h1>This piece has left the wardrobe.</h1>
          <ul className="missing-langs">
            <li lang="mk">Ова парче го нема во гардеробата.</li>
            <li lang="bg">Това парче го няма в гардероба.</li>
            <li lang="sr-Latn">Ovog komada nema u ormaru.</li>
            <li lang="sq">Kjo copë nuk është në garderobë.</li>
          </ul>
          <Link className="btn btn-primary" href="/">
            Choose a country
          </Link>
        </main>
      </body>
    </html>
  );
}
