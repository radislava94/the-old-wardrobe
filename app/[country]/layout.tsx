import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { CookieConsent } from "@/components/cookie-consent";
import { MarketFooter } from "@/components/market-footer";
import { MarketHeader } from "@/components/market-header";
import { JsonLd } from "@/components/json-ld";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { fontClassName } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import { privacyPath } from "@/lib/paths";
import { organizationJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return countryCodes.map((country) => ({ country }));
}

export const viewport: Viewport = {
  themeColor: "#f4ecd8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "The Old Wardrobe",
    template: "%s · The Old Wardrobe",
  },
  applicationName: "The Old Wardrobe",
  authors: [{ name: "The Old Wardrobe" }],
  formatDetection: { telephone: false, email: false, address: false },
};

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);

  return (
    <html lang={countries[raw].htmlLang} className={fontClassName}>
      <body>
        <a className="skip" href="#main">
          {dict.skip}
        </a>
        <div className="topbar">{dict.topbar}</div>
        <MarketHeader
          country={raw}
          dict={dict}
          signInLabel={dict.account.signIn}
          accountLabel={dict.account.nav}
        />
        <main id="main">{children}</main>
        <MarketFooter country={raw} dict={dict} />
        <CookieConsent
          label={dict.consent.label}
          text={dict.consent.text}
          essential={dict.consent.essential}
          optional={dict.consent.optional}
          privacy={dict.consent.privacy}
          privacyHref={privacyPath(raw)}
        />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
