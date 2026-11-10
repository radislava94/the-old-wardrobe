/** True when email sign-in can run. OAuth keys are not required. */
export function authReady(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim() && process.env.BETTER_AUTH_SECRET?.trim());
}

/** True when a verification message can actually be sent. */
export function verificationMailReady(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

/**
 * Email sign-up stays closed until Resend can send the verification link.
 * No account is created while this is false.
 */
export function emailSignUpReady(): boolean {
  return authReady() && verificationMailReady();
}

export function isEmailSignUpPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, "").endsWith("/sign-up/email");
}

export function enabledProviders() {
  const ready = authReady();
  return {
    email: ready,
    signUp: emailSignUpReady(),
    google:
      ready && Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()),
    facebook:
      ready &&
      Boolean(process.env.FACEBOOK_CLIENT_ID?.trim() && process.env.FACEBOOK_CLIENT_SECRET?.trim()),
  };
}
