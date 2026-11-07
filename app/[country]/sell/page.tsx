import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SellForm } from "@/components/sell-form";
import { categoryKeys } from "@/lib/categories";
import { countries, countryCodes, isCountry, type CountryCode } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { homePath, sellPath, signInPath } from "@/lib/paths";
import { UNITS_PER_EUR } from "@/lib/rates";
import { getSession } from "@/lib/auth/session";
import { profileForAuthUser } from "@/lib/auth/profile";
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
  const session = await getSession();
  const profile = session ? await profileForAuthUser(session.user.id) : null;

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
        {session ? (
          <SellForm
            blobConfigured={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
            production={process.env.VERCEL_ENV === "production"}
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
          />
        ) : (
          <p className="lead">
            {dict.sell.signIn}{" "}
            <Link href={`${signInPath(raw)}?next=${encodeURIComponent(sellPath(raw))}`}>
              {dict.account.signIn}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

function sellCopy(dict: ReturnType<typeof getDictionary>) {
  return {
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
    photoLocal: dict.sell.photoLocal,
    photoBlob: dict.sell.photoBlob,
    photoCount: dict.sell.photoCount,
    signIn: dict.sell.signIn,
    saveDraft: dict.sell.saveDraft,
    submit: dict.sell.submit,
    brand: dict.sell.brand,
    condition: dict.sell.condition,
    conditions: [
      { value: dict.sell.conditions.loved, label: dict.sell.conditions.loved },
      { value: dict.sell.conditions.kept, label: dict.sell.conditions.kept },
      { value: dict.sell.conditions.repair, label: dict.sell.conditions.repair },
    ],
    country: dict.sell.country,
    currency: dict.sell.currency,
    freeShipping: dict.sell.freeShipping,
    freeShippingHint: dict.sell.freeShippingHint,
    freeShippingOver: dict.sell.freeShippingOver,
    freeShippingOverHint: dict.sell.freeShippingOverHint,
    sellerKind: dict.sell.sellerKind,
    sellerPrivate: dict.sell.sellerPrivate,
    sellerBusiness: dict.sell.sellerBusiness,
    errors: {
      fields: dict.sell.photoMissing,
      photo: dict.sell.photoMissing,
      "photo-type": dict.sell.photoType,
      "photo-size": dict.sell.photoSize,
      "photo-blob": dict.sell.photoBlob,
      "photo-count": dict.sell.photoCount,
      "photo-spoofed": dict.sell.photoSpoofed,
      "photo-incomplete": dict.sell.photoIncomplete,
      "photo-foreign": dict.sell.photoForeign,
      "photo-missing": dict.sell.photoMissing,
      forbidden: dict.sell.signIn,
    },
  };
}
