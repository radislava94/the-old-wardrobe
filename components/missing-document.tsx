import Link from "next/link";
import { DocumentTitle } from "@/components/document-title";
import { fontClassName } from "@/lib/fonts";

/** Full document for a URL that never reached a country layout. */
export function MissingDocument() {
  return (
    <html lang="en" className={fontClassName}>
      <body>
        <DocumentTitle title="This piece has left the wardrobe · The Old Wardrobe" />
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
