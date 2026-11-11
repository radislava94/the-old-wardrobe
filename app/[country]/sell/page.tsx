import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SellForm } from "@/components/sell-form";
import { commissionConfig } from "@/lib/commission/config";
import { feePreviewCopy } from "@/lib/commission/preview-copy";
import { freeSalesLeftFor } from "@/lib/commission/remaining";
import { categoryKeys } from "@/lib/categories";
import { countries, countryCodes, isCountry, type CountryCode } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { homePath, sellPath } from "@/lib/paths";
import { UNITS_PER_EUR } from "@/lib/rates";
import { getSession } from "@/lib/auth/session";
import { profileForAuthUser } from "@/lib/auth/profile";
import { sellCopy } from "@/lib/listings/sell-copy";
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
  await connection();
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const country = countries[raw];
  const session = await getSession();
  const profile = session ? await profileForAuthUser(session.user.id) : null;
  const freeSalesLeft = profile ? await freeSalesLeftFor(profile.id) : commissionConfig.welcomeSales;

  return (
    <section className="page-block">
      <div className="wrap sell-layout sell-layout-wide">
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
            signedIn={Boolean(session)}
            returnPath={sellPath(raw)}
            blobConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
            countries={countryCodes.map((code) => ({
              code,
              label: countries[code].nativeName,
              currency: countries[code].currency,
              cities: [...countries[code].cities],
            }))}
            categories={categoryKeys.map((key) => ({
              value: key,
              label: dict.categories[key],
            }))}
            initial={{
              country: (profile?.country ?? raw) as CountryCode,
              title: "",
              category: "",
              size: "",
              price: "",
              city: profile?.city && country.cities.includes(profile.city) ? profile.city : "",
              brand: "",
              condition: dict.sell.conditions.loved,
              story: "",
              photoUrl: "",
              sellerKind: profile?.sellerKind === "business" ? "business" : "private",
              freeShipping: false,
              freeShippingOver: "",
            }}
            copy={sellCopy(dict)}
            freeSalesLeft={freeSalesLeft}
            fees={feePreviewCopy(dict, freeSalesLeft)}
          />
      </div>
    </section>
  );
}
