import { isCountry, type CountryCode } from "../countries";

type Locale = CountryCode | "en";

const verification: Record<Locale, { subject: string; text: (url: string) => string }> = {
  mk: {
    subject: "Потврдете ја е-поштата",
    text: (url) =>
      `Отворете го линкот за да ја потврдите сметката на The Old Wardrobe.\n\n${url}\n\nАко не сте ја отвориле вие сметката, занемарете ја поракава.`,
  },
  bg: {
    subject: "Потвърдете имейла",
    text: (url) =>
      `Отворете връзката, за да потвърдите сметката в The Old Wardrobe.\n\n${url}\n\nАко не сте отваряли сметката, игнорирайте това писмо.`,
  },
  "sr-rs": {
    subject: "Potvrdite imejl",
    text: (url) =>
      `Otvorite link da potvrdite nalog na The Old Wardrobe.\n\n${url}\n\nAko niste otvarali nalog, zanemarite ovu poruku.`,
  },
  "sq-al": {
    subject: "Konfirmoni emailin",
    text: (url) =>
      `Hapni lidhjen për të konfirmuar llogarinë në The Old Wardrobe.\n\n${url}\n\nNëse nuk e hapët llogarinë ju, shpërfilleni këtë letër.`,
  },
  en: {
    subject: "Confirm your email",
    text: (url) =>
      `Open this link to confirm your account at The Old Wardrobe.\n\n${url}\n\nIf you did not open an account, ignore this message.`,
  },
};

export function localeFromRequest(request: Request | undefined): Locale {
  const header = request?.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== "ow_country") continue;
    const value = decodeURIComponent(rest.join("="));
    if (isCountry(value)) return value;
  }
  return "en";
}

/** Verification mail only. The language follows the country the visitor chose. */
export async function sendVerificationEmail(
  to: string,
  url: string,
  request: Request | undefined,
): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM are required to send the verification email.");
  }
  const copy = verification[localeFromRequest(request)];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: copy.subject,
      text: copy.text(url),
    }),
  });
  if (!response.ok) {
    throw new Error("Could not send the verification email.");
  }
}
