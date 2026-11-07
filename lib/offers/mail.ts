import type { CountryCode } from "../countries";

type Mail = { subject: string; text: string };

function language(country: string): CountryCode {
  if (country === "bg" || country === "sr-rs" || country === "sq-al" || country === "mk") return country;
  return "mk";
}

export function offerDecisionMail(input: {
  country: string;
  accepted: boolean;
  title: string;
  amount: string;
  url: string;
}): Mail {
  const lang = language(input.country);
  const subject = {
    mk: input.accepted ? `Понудата е прифатена: ${input.title}` : `Понудата е одбиена: ${input.title}`,
    bg: input.accepted ? `Офертата е приета: ${input.title}` : `Офертата е отказана: ${input.title}`,
    "sr-rs": input.accepted ? `Ponuda je prihvaćena: ${input.title}` : `Ponuda je odbijena: ${input.title}`,
    "sq-al": input.accepted ? `Oferta u pranua: ${input.title}` : `Oferta u refuzua: ${input.title}`,
  }[lang];
  const text = {
    mk: input.accepted
      ? `Продавачот ја прифаќа понудата од ${input.amount} за „${input.title}“. Ништо не е платено.`
      : `Продавачот ја одбива понудата од ${input.amount} за „${input.title}“. Ништо не е платено.`,
    bg: input.accepted
      ? `Продавачът приема офертата от ${input.amount} за „${input.title}“. Нищо не е платено.`
      : `Продавачът отказва офертата от ${input.amount} за „${input.title}“. Нищо не е платено.`,
    "sr-rs": input.accepted
      ? `Prodavac prihvata ponudu od ${input.amount} za „${input.title}“. Ništa nije plaćeno.`
      : `Prodavac odbija ponudu od ${input.amount} za „${input.title}“. Ništa nije plaćeno.`,
    "sq-al": input.accepted
      ? `Shitësi e pranon ofertën prej ${input.amount} për „${input.title}“. Asgjë nuk është paguar.`
      : `Shitësi e refuzon ofertën prej ${input.amount} për „${input.title}“. Asgjë nuk është paguar.`,
  }[lang];
  return { subject, text: `${text}\n${input.url}\n` };
}

export function priceDropMail(input: {
  country: string;
  title: string;
  next: string;
  previous: string;
  url: string;
}): Mail {
  const lang = language(input.country);
  const subject = {
    mk: `Цена: ${input.title}`,
    bg: `Цена: ${input.title}`,
    "sr-rs": `Cena: ${input.title}`,
    "sq-al": `Çmimi: ${input.title}`,
  }[lang];
  const text = {
    mk: `Цената на „${input.title}“ сега е ${input.next}. Претходно беше ${input.previous}.`,
    bg: `Цената на „${input.title}“ сега е ${input.next}. Преди беше ${input.previous}.`,
    "sr-rs": `Cena „${input.title}“ sada je ${input.next}. Ranije je bila ${input.previous}.`,
    "sq-al": `Çmimi i „${input.title}“ tani është ${input.next}. Më parë ishte ${input.previous}.`,
  }[lang];
  return { subject, text: `${text}\n${input.url}\n` };
}
