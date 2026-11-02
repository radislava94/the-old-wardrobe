import type { CountryCode } from "./countries";

/** Short strings for the picker banner. Kept separate so the client bundle stays small. */
export const suggestions: Record<CountryCode, { text: string; cta: string }> = {
  mk: {
    text: "Изгледа дека читаш на македонски. Да ја отвориме гардеробата за Северна Македонија?",
    cta: "Отвори",
  },
  bg: {
    text: "Изглежда четеш на български. Да отворим ли гардероба за България?",
    cta: "Отвори",
  },
  "sr-rs": {
    text: "Izgleda da čitaš na srpskom. Da otvorimo ormar za Srbiju?",
    cta: "Otvori",
  },
  "sq-al": {
    text: "Duket se lexon shqip. Ta hapim garderobën për Shqipërinë?",
    cta: "Hape",
  },
};

export const missingCopy: Record<
  CountryCode,
  { title: string; body: string; home: string }
> = {
  mk: {
    title: "Ова парче го нема во гардеробата.",
    body: "Штандот е преместен, или врската е стара.",
    home: "Назад кон вратата",
  },
  bg: {
    title: "Това парче го няма в гардероба.",
    body: "Щандът е преместен или връзката е стара.",
    home: "Обратно към вратата",
  },
  "sr-rs": {
    title: "Ovog komada nema u ormaru.",
    body: "Štand je pomeren ili je veza stara.",
    home: "Nazad do vrata",
  },
  "sq-al": {
    title: "Kjo copë nuk është në garderobë.",
    body: "Stenda është zhvendosur, ose lidhja është e vjetër.",
    home: "Prapa te dera",
  },
};
