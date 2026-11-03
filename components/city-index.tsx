import Link from "next/link";
import { categoryKeys } from "@/lib/categories";
import { countries, type CountryCode } from "@/lib/countries";
import type { Dictionary } from "@/lib/i18n";
import { categoryCityPath } from "@/lib/paths";
import { seoChrome } from "@/lib/seo/chrome";
import { citySlug } from "@/lib/seo/places";
import type { Listing } from "@/lib/types";

export function CityIndex({
  country,
  dict,
  items,
}: {
  country: CountryCode;
  dict: Dictionary;
  items: readonly Listing[];
}) {
  const chrome = seoChrome[country];
  return (
    <section className="places" aria-label={chrome.byCity}>
      <div className="wrap">
        <div className="places-head">
          <h2>{chrome.placesTitle}</h2>
          <p className="lead">{chrome.placesLead}</p>
        </div>
        <div className="places-grid">
          {countries[country].cities.map((city) => {
            const slug = citySlug(country, city);
            if (!slug) return null;
            return (
              <article className="place-card" key={city}>
                <h3>{city}</h3>
                <ul>
                  {categoryKeys.map((key) => {
                    const count = items.filter(
                      (item) => item.category === key && item.city === city,
                    ).length;
                    return (
                      <li key={key}>
                        <Link href={categoryCityPath(country, key, slug)}>
                          {dict.categories[key]}
                          <small>{dict.pieces(count)}</small>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
