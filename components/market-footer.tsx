import Link from "next/link";
import { categoryKeys } from "@/lib/categories";
import type { CountryCode } from "@/lib/countries";
import type { Dictionary } from "@/lib/i18n";
import { categoryPath, homePath, privacyPath, searchPath, sellPath } from "@/lib/paths";
import { CONTACT_EMAIL } from "@/lib/site";
import { LetterForm } from "./letter-form";

export function MarketFooter({
  country,
  dict,
}: {
  country: CountryCode;
  dict: Dictionary;
}) {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div className="brand">
            <div className="word">The Old Wardrobe</div>
            <p>{dict.footer.blurb}</p>
          </div>
          <div>
            <h2>{dict.footer.shop}</h2>
            <ul>
              <li>
                <Link href={searchPath(country)}>{dict.footer.newArrivals}</Link>
              </li>
              {categoryKeys.map((key) => (
                <li key={key}>
                  <Link href={categoryPath(country, key)}>{dict.categories[key]}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{dict.footer.help}</h2>
            <ul>
              <li>
                <Link href={sellPath(country)}>{dict.footer.howToSell}</Link>
              </li>
              <li>
                <Link href={`${homePath(country)}#how`}>{dict.footer.shipping}</Link>
              </li>
              <li>
                <Link href={`${homePath(country)}#how`}>{dict.footer.returns}</Link>
              </li>
              <li>
                <Link href={`${homePath(country)}#story`}>{dict.footer.about}</Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{dict.footer.contact}</a>
              </li>
              <li>
                <Link href={privacyPath(country)}>{dict.footer.privacy}</Link>
              </li>
            </ul>
          </div>
          <div className="nl">
            <h2>{dict.footer.letterTitle}</h2>
            <p className="letter-lead">{dict.footer.letterBody}</p>
            <LetterForm
              label={dict.footer.emailLabel}
              placeholder={dict.footer.emailPlaceholder}
              join={dict.footer.join}
              soon={dict.footer.letterSoon}
            />
          </div>
        </div>
        <div className="fine">
          <span>{dict.footer.rights}</span>
          <span>{dict.footer.magic}</span>
        </div>
      </div>
    </footer>
  );
}
