import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SellForm } from "@/components/sell-form";
import { categoryKeys } from "@/lib/categories";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { homePath, sellPath } from "@/lib/paths";
import { UNITS_PER_EUR } from "@/lib/rates";
import {
  absoluteUrl,
  languageAlternates,
  pageMetadata,
  sellAlternatePaths,
} from "@/lib/seo";

export function generateStaticParams() {
  return countryCodes.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: raw } = await params;
  if (!isCountry(raw)) return {};
  const dict = getDictionary(raw);
  return pageMetadata({
    title: dict.meta.sellTitle,
    description: dict.meta.sellDescription,
    canonicalPath: sellPath(raw),
    languages: languageAlternates(sellAlternatePaths(), sellPath("mk")),
    locale: countries[raw].ogLocale,
    image: {
      url: absoluteUrl(heroPhoto.src),
      alt: dict.hero.imageAlt,
      width: heroPhoto.width,
      height: heroPhoto.height,
    },
  });
}

export default async function SellPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const country = countries[raw];

  return (
    <section className="page-block">
      <div className="wrap sell-layout">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(raw) },
            { name: dict.sell.title, path: sellPath(raw) },
          ]}
        />
        <div className="sell-intro">
          <p className="eyebrow">{dict.nav.sell}</p>
          <h1>{dict.sell.title}</h1>
          <p className="lead">{dict.sell.intro}</p>
          <p className="hint">{dict.sell.ratesNote}</p>
          <p className="rates-table">
            1 EUR = {UNITS_PER_EUR.MKD} MKD · {UNITS_PER_EUR.RSD} RSD · {UNITS_PER_EUR.ALL} ALL
          </p>
        </div>
        <SellForm
          categories={categoryKeys.map((key) => ({
            value: key,
            label: dict.categories[key],
          }))}
          cities={[...country.cities]}
          currencyLabel={country.currency}
          copy={{
            name: dict.sell.name,
            namePlaceholder: dict.sell.namePlaceholder,
            category: dict.sell.category,
            size: dict.sell.size,
            sizePlaceholder: dict.sell.sizePlaceholder,
            price: dict.sell.price,
            city: dict.sell.city,
            story: dict.sell.story,
            storyPlaceholder: dict.sell.storyPlaceholder,
            photo: dict.sell.photo,
            photoHint: dict.sell.photoHint,
            submit: dict.sell.submit,
            successTitle: dict.sell.successTitle,
            successBody: dict.sell.successBody("{name}"),
          }}
        />
      </div>
    </section>
  );
}
