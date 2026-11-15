import type { CountryCode } from "./countries";

type Mail = { subject: string; text: string };

function language(country: string): CountryCode {
  if (country === "bg" || country === "sr-rs" || country === "sq-al" || country === "mk") {
    return country;
  }
  return "mk";
}

/** Seller notice when someone saves a listing. Language follows the listing's country. */
export function savedListingMail(
  country: string,
  buyerName: string,
  title: string,
  url: string,
): Mail {
  const line = {
    mk: `${buyerName} го зачува парчето „${title}“ на The Old Wardrobe.`,
    bg: `${buyerName} запази „${title}“ в The Old Wardrobe.`,
    "sr-rs": `${buyerName} je sačuvao „${title}“ na The Old Wardrobe.`,
    "sq-al": `${buyerName} e ruajti „${title}“ në The Old Wardrobe.`,
  }[language(country)];
  const subject = {
    mk: `Зачувано: ${title}`,
    bg: `Запазено: ${title}`,
    "sr-rs": `Sačuvano: ${title}`,
    "sq-al": `Ruajtur: ${title}`,
  }[language(country)];
  return { subject, text: `${line}\n${url}\n` };
}
