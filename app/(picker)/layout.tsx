import type { Metadata, Viewport } from "next";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd } from "@/components/json-ld";
import { LogoMark } from "@/components/logo";
import { SuggestBanner } from "@/components/suggest-banner";
import { countries, countryCodes } from "@/lib/countries";
import { fontClassName } from "@/lib/fonts";
import { pickerCopy } from "@/lib/picker-copy";
import { organizationJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import Link from "next/link";
import { cookies } from "next/headers";
import "../globals.css";

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
  formatDetection: { telephone: false, email: false, address: false },
};

export default async function PickerLayout({ children }: { children: React.ReactNode }) {
  const consent = (await cookies()).get("ow_consent")?.value;
  return (
    <html lang="en" className={fontClassName}>
      <body>
        <a className="skip" href="#main">
          {pickerCopy.skip}
        </a>
        <div className="topbar">{pickerCopy.topbar}</div>
        <SuggestBanner label={pickerCopy.suggestLabel} />
        <header>
          <div className="wrap nav picker-nav">
            <Link className="logo" href="/">
              <LogoMark />
              <span>
                <span className="word">
                  The Old <i>Wardrobe</i>
                </span>
                <small>Pre-loved · Est. 2026</small>
              </span>
            </Link>
            <nav className="switcher" aria-label="Country">
              {countryCodes.map((code) => (
                <Link
                  key={code}
                  href={`/${code}`}
                  hrefLang={countries[code].hreflang}
                  lang={countries[code].htmlLang}
                >
                  {countries[code].short}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="footer-slim">
          <div className="wrap">
            <div className="fine">
              <span>© 2026 The Old Wardrobe</span>
              <Link href="/privacy">Privacy</Link>
              <span>Made with care & a little magic ✦</span>
            </div>
          </div>
        </footer>
        {consent ? null : (
          <CookieConsent
            text="A session cookie is stored only after you sign in. We remember this choice so we do not ask again. There are no advertising or analytics cookies. Accept optional does not turn anything else on today."
            essential="Essential only"
            optional="Accept optional"
            privacy="Privacy"
            privacyHref="/privacy"
          />
        )}
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
