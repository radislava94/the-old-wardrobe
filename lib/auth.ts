import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { cookies } from "next/headers";
import { getDb } from "./db/client";
import * as schema from "./db/schema";
import { sendVerificationEmail } from "./auth/mail";
import { countryFromCookie, ensureProfile } from "./auth/profile";

export { authReady, enabledProviders } from "./auth/config";

/**
 * Built on first use so `next build` does not open Postgres or require
 * BETTER_AUTH_SECRET. Email sign-in stays available without OAuth keys.
 * Google and Facebook are registered only when both of their variables are set.
 */
function buildAuth() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set.");
  const googleId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const facebookId = process.env.FACEBOOK_CLIENT_ID;
  const facebookSecret = process.env.FACEBOOK_CLIENT_SECRET;

  return betterAuth({
    secret,
    ...(process.env.BETTER_AUTH_URL?.trim()
      ? { baseURL: process.env.BETTER_AUTH_URL.trim() }
      : {}),
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }, request) => {
        await sendVerificationEmail(user.email, url, request);
      },
    },
    socialProviders: {
      ...(googleId && googleSecret
        ? {
            google: {
              clientId: googleId,
              clientSecret: googleSecret,
              prompt: "select_account" as const,
            },
          }
        : {}),
      ...(facebookId && facebookSecret
        ? { facebook: { clientId: facebookId, clientSecret: facebookSecret } }
        : {}),
    },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (person) => {
          await deleteBefore(person.id);
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (created) => {
            const jar = await cookies();
            const country = countryFromCookie(jar.get("ow_country")?.value, "mk");
            await ensureProfile(
              { id: created.id, name: created.name, email: created.email },
              country,
            );
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let auth: ReturnType<typeof buildAuth> | undefined;

export function getAuth() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!process.env.BETTER_AUTH_SECRET?.trim()) {
    throw new Error("BETTER_AUTH_SECRET is not set.");
  }
  auth ??= buildAuth();
  return auth;
}

async function deleteBefore(userId: string) {
  const { deleteMarketplaceData } = await import("./auth/profile");
  await deleteMarketplaceData(userId);
}
