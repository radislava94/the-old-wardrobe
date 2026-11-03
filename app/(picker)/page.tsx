import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { countries, countryCodes } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { pickerCopy } from "@/lib/picker-copy";
import { absoluteUrl, homeAlternatePaths, languageAlternates } from "@/lib/seo";

const rotations = ["-1.2deg", "0.8deg", "-0.6deg", "1.1deg"];

export const metadata: Metadata = {
  title: { absolute: `${pickerCopy.metaTitle} · The Old Wardrobe` },
  description: pickerCopy.metaDescription,
  alternates: {
    canonical: absoluteUrl("/"),
    languages: languageAlternates(homeAlternatePaths(), "/"),
  },
  openGraph: {
    title: `${pickerCopy.metaTitle} · The Old Wardrobe`,
    description: pickerCopy.metaDescription,
    url: absoluteUrl("/"),
    siteName: "The Old Wardrobe",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: absoluteUrl(heroPhoto.src),
        alt: pickerCopy.imageAlt,
        width: heroPhoto.width,
        height: heroPhoto.height,
      },
    ],
  },
};

export default function PickerPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <p className="eyebrow">{pickerCopy.eyebrow}</p>
            <h1>
              {pickerCopy.title}
              <br />
              <em>{pickerCopy.titleEm}</em>
            </h1>
            <p className="lead">{pickerCopy.lead}</p>
          </div>
          <div className="door">
            <span className="snow" aria-hidden="true">
              ❄
            </span>
            <div className="frame">
              <div className="shot">
                <Image
                  src={heroPhoto}
                  alt={pickerCopy.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 760px) 280px, 440px"
                />
              </div>
              <span className="knob" aria-hidden="true" />
            </div>
            <div className="tag">
              <div className="ltag">
                <b>{pickerCopy.tagTitle}</b>
                {pickerCopy.tagBody}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="picker" aria-label="Countries">
        <div className="wrap country-grid">
          {countryCodes.map((code, index) => {
            const country = countries[code];
            const dict = getDictionary(code);
            return (
              <Link
                key={code}
                href={`/${code}`}
                className="country-card"
                hrefLang={country.hreflang}
                lang={country.htmlLang}
                style={{ ["--r" as string]: rotations[index] ?? "0deg" }}
              >
                <span className="mono card-kicker">
                  {country.short} · {country.currency}
                </span>
                <h2>{country.nativeName}</h2>
                <p>
                  {country.languageName}
                  <br />
                  {country.currencyName}
                </p>
                <span className="enter">{dict.pickerEnter}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
