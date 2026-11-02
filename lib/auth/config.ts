/** True when email sign-in can run. OAuth keys are not required. */
export function authReady(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim() && process.env.BETTER_AUTH_SECRET?.trim());
}

export function enabledProviders() {
  const ready = authReady();
  return {
    email: ready,
    google: ready && Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    facebook:
      ready && Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
  };
}
