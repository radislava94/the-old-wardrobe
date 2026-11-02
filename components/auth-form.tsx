"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({
  country,
  nextPath,
  google,
  facebook,
  copy,
}: {
  country: string;
  nextPath: string;
  google: boolean;
  facebook: boolean;
  copy: {
    signInTitle: string;
    signUpTitle: string;
    email: string;
    password: string;
    passwordHint: string;
    name: string;
    signIn: string;
    signUp: string;
    google: string;
    facebook: string;
    or: string;
    both: string;
    error: string;
  };
}) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function rememberCountry() {
    document.cookie = `ow_country=${country}; Path=/; Max-Age=600; SameSite=Lax`;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    rememberCountry();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "");
    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name, callbackURL: nextPath })
        : await authClient.signIn.email({ email, password, callbackURL: nextPath });
    setPending(false);
    if (result.error) {
      setError(result.error.message || copy.error);
      return;
    }
    window.location.assign(nextPath);
  }

  async function social(provider: "google" | "facebook") {
    setError(null);
    rememberCountry();
    const result = await authClient.signIn.social({ provider, callbackURL: nextPath });
    if (result.error) setError(result.error.message || copy.error);
  }

  return (
    <div className="auth-panel">
      <div className="auth-switch" role="tablist">
        <button
          type="button"
          className={mode === "sign-in" ? "btn btn-ghost is-on" : "btn btn-ghost"}
          aria-pressed={mode === "sign-in"}
          onClick={() => {
            setMode("sign-in");
            setError(null);
          }}
        >
          {copy.signInTitle}
        </button>
        <button
          type="button"
          className={mode === "sign-up" ? "btn btn-ghost is-on" : "btn btn-ghost"}
          aria-pressed={mode === "sign-up"}
          onClick={() => {
            setMode("sign-up");
            setError(null);
          }}
        >
          {copy.signUpTitle}
        </button>
      </div>
      <p className="hint">{copy.both}</p>
      {google || facebook ? (
        <div className="auth-social">
          {google ? (
            <button type="button" className="btn btn-ghost" onClick={() => social("google")}>
              {copy.google}
            </button>
          ) : null}
          {facebook ? (
            <button type="button" className="btn btn-ghost" onClick={() => social("facebook")}>
              {copy.facebook}
            </button>
          ) : null}
          <p className="hint">{copy.or}</p>
        </div>
      ) : null}
      <form className="sell-form" onSubmit={onSubmit}>
        {mode === "sign-up" ? (
          <label>
            <span>{copy.name}</span>
            <input name="name" required maxLength={80} autoComplete="name" />
          </label>
        ) : null}
        <label>
          <span>{copy.email}</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          <span>{copy.password}</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          />
          <small>{copy.passwordHint}</small>
        </label>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {mode === "sign-up" ? copy.signUp : copy.signIn}
        </button>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
