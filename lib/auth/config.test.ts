import { afterEach, describe, expect, it } from "vitest";
import { authReady, emailSignUpReady, isEmailSignUpPath, verificationMailReady } from "./config";

const keys = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FACEBOOK_CLIENT_ID",
  "FACEBOOK_CLIENT_SECRET",
] as const;

const previous = new Map<string, string | undefined>();

function setEnv(values: Partial<Record<(typeof keys)[number], string>>) {
  for (const key of keys) {
    if (!previous.has(key)) previous.set(key, process.env[key]);
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
}

afterEach(() => {
  for (const [key, value] of previous) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  previous.clear();
});

describe("email sign-up availability", () => {
  it("stays closed when Resend is unset, even if the database and secret are present", () => {
    setEnv({
      DATABASE_URL: "postgres://wardrobe:wardrobe@localhost:5432/wardrobe",
      BETTER_AUTH_SECRET: "secret",
    });
    expect(authReady()).toBe(true);
    expect(verificationMailReady()).toBe(false);
    expect(emailSignUpReady()).toBe(false);
  });

  it("opens only when verification mail can be sent", () => {
    setEnv({
      DATABASE_URL: "postgres://wardrobe:wardrobe@localhost:5432/wardrobe",
      BETTER_AUTH_SECRET: "secret",
      RESEND_API_KEY: "re_test",
      EMAIL_FROM: "The Old Wardrobe <hello@theoldwardrobe.example>",
    });
    expect(emailSignUpReady()).toBe(true);
  });

  it("does not treat a missing database as a reason to boot-fail the check", () => {
    setEnv({});
    expect(authReady()).toBe(false);
    expect(emailSignUpReady()).toBe(false);
  });

  it("recognises the email sign-up route", () => {
    expect(isEmailSignUpPath("/api/auth/sign-up/email")).toBe(true);
    expect(isEmailSignUpPath("/api/auth/sign-up/email/")).toBe(true);
    expect(isEmailSignUpPath("/api/auth/sign-in/email")).toBe(false);
    expect(isEmailSignUpPath("/api/auth/get-session")).toBe(false);
  });
});
