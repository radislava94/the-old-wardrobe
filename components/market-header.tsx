import Link from "next/link";
import type { CountryCode } from "@/lib/countries";
import type { Dictionary } from "@/lib/i18n";
import { blogTwinMap } from "@/lib/journal/posts";
import { journalChrome } from "@/lib/journal/chrome";
import { homePath, searchPath } from "@/lib/paths";
import { AccountLink } from "./account-link";
import { CountrySwitcher } from "./country-switcher";
import { LogoMark } from "./logo";
import { MainNav } from "./main-nav";

export function MarketHeader({
  country,
  dict,
  signInLabel,
  accountLabel,
}: {
  country: CountryCode;
  dict: Dictionary;
  signInLabel: string;
  accountLabel: string;
}) {
  return (
    <header>
      <div className="wrap nav">
        <Link className="logo" href={homePath(country)}>
          <LogoMark />
          <span>
            <span className="word">
              The Old <i>Wardrobe</i>
            </span>
            <small>{dict.tagline}</small>
          </span>
        </Link>
        <MainNav
          country={country}
          label={dict.nav.main}
          browse={dict.nav.browse}
          journal={journalChrome[country].nav}
          sell={dict.nav.sell}
          about={dict.nav.about}
        />
        <AccountLink country={country} signInLabel={signInLabel} accountLabel={accountLabel} />
        <form className="search" action={searchPath(country)} method="get" role="search">
          <button type="submit" aria-label={dict.searchLabel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b5a48" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <input name="q" placeholder={dict.searchPlaceholder} aria-label={dict.searchLabel} />
        </form>
        <div className="icons" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b2f24" strokeWidth="1.8">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b2f24" strokeWidth="1.8">
            <path d="M5 8h14l-1 12H6L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
        </div>
        <CountrySwitcher
          country={country}
          label={dict.switcherLabel}
          allLabel={dict.allCountries}
          blogTwins={blogTwinMap()}
        />
      </div>
    </header>
  );
}
