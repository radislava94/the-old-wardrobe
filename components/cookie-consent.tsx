/**
 * Shown until the visitor chooses. The two buttons are the same weight.
 * The form works without JavaScript. Optional cookies are not used;
 * accepting them does not turn anything on.
 */
export function CookieConsent({
  text,
  essential,
  optional,
  privacy,
  privacyHref,
}: {
  text: string;
  essential: string;
  optional: string;
  privacy: string;
  privacyHref: string;
}) {
  return (
    <aside className="consent" aria-label={privacy}>
      <p>{text}</p>
      <form className="consent-actions" action="/api/consent" method="post">
        <a href={privacyHref}>{privacy}</a>
        <button type="submit" className="btn btn-ghost" name="choice" value="essential">
          {essential}
        </button>
        <button type="submit" className="btn btn-ghost" name="choice" value="all">
          {optional}
        </button>
      </form>
    </aside>
  );
}
