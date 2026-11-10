"use client";

import { useEffect, useState } from "react";

/**
 * The choice is read in the browser so the page can stay static.
 * Both buttons have the same weight. Optional cookies are not used.
 */
export function CookieConsent({
  label,
  text,
  essential,
  optional,
  privacy,
  privacyHref,
}: {
  label: string;
  text: string;
  essential: string;
  optional: string;
  privacy: string;
  privacyHref: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const chosen = document.cookie.split("; ").some((part) => part.startsWith("ow_consent="));
    if (chosen) setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <aside className="consent" aria-label={label}>
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
