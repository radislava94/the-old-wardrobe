import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { enabledProviders } from "@/lib/auth/config";
import { isCountry } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { privacyPath, safeNextPath } from "@/lib/paths";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: raw } = await params;
  if (!isCountry(raw)) {
    return { robots: { index: false, follow: false }, title: "Sign in" };
  }
  return {
    robots: { index: false, follow: false },
    title: getDictionary(raw).auth.signInTitle,
  };
}

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ country: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const providers = enabledProviders();
  const nextPath = safeNextPath(raw, (await searchParams).next);

  return (
    <section className="page-block">
      <div className="wrap sell-layout">
        <p className="eyebrow">{dict.account.signIn}</p>
        <h1>{dict.auth.signInTitle}</h1>
        <p className="lead">{dict.auth.both}</p>
        {providers.email ? (
          <AuthForm
            country={raw}
            nextPath={nextPath}
            google={providers.google}
            facebook={providers.facebook}
            signUpEnabled={providers.signUp}
            copy={{
              signUpTitle: dict.auth.signUpTitle,
              email: dict.auth.email,
              password: dict.auth.password,
              passwordHint: dict.auth.passwordHint,
              name: dict.auth.name,
              signIn: dict.auth.signIn,
              signUp: dict.auth.signUp,
              switchToSignUp: dict.auth.switchToSignUp,
              switchToSignIn: dict.auth.switchToSignIn,
              google: dict.auth.google,
              facebook: dict.auth.facebook,
              or: dict.auth.or,
              both: dict.auth.both,
              error: dict.auth.error,
              verifySent: dict.auth.verifySent,
              unverified: dict.auth.unverified,
              signUpUnavailable: dict.auth.signUpUnavailable,
            }}
          />
        ) : (
          <p className="hint">{dict.auth.configured}</p>
        )}
        <p className="hint">
          <Link href={privacyPath(raw)}>{dict.auth.privacy}</Link>
        </p>
      </div>
    </section>
  );
}
