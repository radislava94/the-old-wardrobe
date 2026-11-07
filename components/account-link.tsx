"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import type { CountryCode } from "@/lib/countries";
import { accountPath, signInPath } from "@/lib/paths";

/** Session is read in the browser so the country layout can stay static. */
export function AccountLink({
  country,
  signInLabel,
  accountLabel,
}: {
  country: CountryCode;
  signInLabel: string;
  accountLabel: string;
}) {
  const { data } = authClient.useSession();
  const signedIn = Boolean(data?.user);
  return (
    <Link className="account-link" href={signedIn ? accountPath(country) : signInPath(country)}>
      {signedIn ? accountLabel : signInLabel}
    </Link>
  );
}
