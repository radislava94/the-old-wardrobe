import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteAccount, updateProfile } from "@/lib/account/actions";
import { authReady } from "@/lib/auth/config";
import { ensureProfile } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/session";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { privacyPath, signInPath } from "@/lib/paths";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Account",
};

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const query = await searchParams;

  if (!authReady()) {
    return (
      <section className="page-block">
        <div className="wrap sell-layout">
          <h1>{dict.account.title}</h1>
          <p className="lead">{dict.account.needAuth}</p>
        </div>
      </section>
    );
  }

  const session = await getSession();
  if (!session) redirect(signInPath(raw));
  const profile = await ensureProfile(session.user, raw);

  return (
    <section className="page-block">
      <div className="wrap sell-layout">
        <p className="eyebrow">{dict.account.nav}</p>
        <h1>{dict.account.title}</h1>
        <p className="lead">{dict.account.intro}</p>
        {query.saved ? (
          <p className="hint" role="status">
            {dict.account.saved}
          </p>
        ) : null}
        {query.error === "confirm" ? (
          <p className="form-error" role="alert">
            {dict.account.confirmError}
          </p>
        ) : null}
        {query.error && query.error !== "confirm" ? (
          <p className="form-error" role="alert">
            {dict.auth.error}
          </p>
        ) : null}

        <form className="sell-form" action={updateProfile}>
          <input type="hidden" name="currentCountry" value={raw} />
          <label>
            <span>{dict.account.name}</span>
            <input name="name" required maxLength={80} defaultValue={profile.name} />
          </label>
          <label>
            <span>{dict.account.email}</span>
            <input value={session.user.email} readOnly />
          </label>
          <div className="sell-row">
            <label>
              <span>{dict.account.city}</span>
              <input name="city" maxLength={80} defaultValue={profile.city} />
              <small>{dict.account.cityHint}</small>
            </label>
            <label>
              <span>{dict.account.country}</span>
              <select name="country" defaultValue={profile.country}>
                {countryCodes.map((code) => (
                  <option key={code} value={code}>
                    {countries[code].nativeName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>{dict.account.bio}</span>
            <textarea name="bio" rows={4} maxLength={600} defaultValue={profile.bio} />
          </label>
          <button type="submit" className="btn btn-primary">
            {dict.account.save}
          </button>
        </form>

        <section className="account-block">
          <h2>{dict.account.exportTitle}</h2>
          <p>{dict.account.exportBody}</p>
          {/* Full navigation so the browser saves the JSON attachment. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-ghost" href="/api/account/export">
            {dict.account.export}
          </a>
        </section>

        <section className="account-block">
          <h2>{dict.account.deleteTitle}</h2>
          <p>{dict.account.deleteBody}</p>
          <form className="sell-form" action={deleteAccount}>
            <input type="hidden" name="country" value={raw} />
            <label>
              <span>{dict.account.deleteConfirm}</span>
              <input name="confirm" type="email" required autoComplete="off" />
            </label>
            <label>
              <span>{dict.account.deletePassword}</span>
              <input name="password" type="password" autoComplete="current-password" />
            </label>
            <button type="submit" className="btn btn-ghost">
              {dict.account.deleteButton}
            </button>
          </form>
        </section>

        <p className="hint">
          <Link href={privacyPath(raw)}>{dict.footer.privacy}</Link>
        </p>
      </div>
    </section>
  );
}
