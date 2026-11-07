import type { CountryCode } from "../countries";

export type JournalChrome = {
  nav: string;
  indexTitle: string;
  indexDescription: string;
  kicker: string;
  lead: string;
  shop: string;
  related: string;
  read: string;
  /** Shown when this article has no twin in every country. */
  onlyHere: string;
  /** Appended to the switcher name when the control opens the journal index. */
  fallbackName: string;
};

export const journalChrome: Record<CountryCode, JournalChrome> = {
  mk: {
    nav: "Дневник",
    indexTitle: "Дневник од гардеробата",
    indexDescription:
      "Нега на волна, дамки, чување за сезона и како се продава парче од втора рака во Северна Македонија. Цени во денари, без измислени бројачи.",
    kicker: "Белешки · втора рака",
    lead: "Кратки упатства за волна, дамки и оглас. Напишани за Скопје и Битола, не преведени од туѓ дневник.",
    shop: "Од истата закачалка",
    related: "Полици што ја допираат темата",
    read: "Прочитај",
    onlyHere:
      "Оваа белешка ја нема на секој јазик. Каде што ја нема, копчето за јазик го отвора дневникот на таа земја, не друга статија.",
    fallbackName: "Дневник. Нема иста белешка.",
  },
  bg: {
    nav: "Дневник",
    indexTitle: "Дневник от гардероба",
    indexDescription:
      "Пране на вълна, петна, съхранение и как се продава дреха втора ръка в България. Цени в евро, без измислени бройки.",
    kicker: "Бележки · втора ръка",
    lead: "Кратки упътвания за вълна, петна и обява. Написани за София и Пловдив, не преведени от чужд дневник.",
    shop: "От същата закачалка",
    related: "Щандове по темата",
    read: "Прочети",
    onlyHere:
      "Тази бележка я няма на всеки език. Където я няма, бутонът за език отваря дневника на тази страна, не друга статия.",
    fallbackName: "Дневник. Няма същата бележка.",
  },
  "sr-rs": {
    nav: "Dnevnik",
    indexTitle: "Dnevnik iz ormara",
    indexDescription:
      "Pranje vune, fleke, čuvanje sezone i kako se prodaje komad iz druge ruke u Srbiji. Cene u dinarima, bez izmišljenih brojača.",
    kicker: "Beleške · druga ruka",
    lead: "Kratka uputstva za vunu, fleke i oglas. Pisana za Beograd i Novi Sad, ne prevedena iz tuđeg dnevnika.",
    shop: "Sa iste vešalice",
    related: "Police koje dotiču temu",
    read: "Pročitaj",
    onlyHere:
      "Ove beleške nema na svakom jeziku. Gde je nema, dugme za jezik otvara dnevnik te zemlje, ne drugi članak.",
    fallbackName: "Dnevnik. Nema iste beleške.",
  },
  "sq-al": {
    nav: "Ditar",
    indexTitle: "Ditar nga garderoba",
    indexDescription:
      "Larja e leshit, njollat, ruajtja e stinës dhe si shitet një copë e dorës së dytë në Shqipëri. Çmime në lekë, pa numërues të sajuar.",
    kicker: "Shënime · dorë e dytë",
    lead: "Udhëzime të shkurtra për leshin, njollat dhe njoftimin. Të shkruara për Tiranën dhe Durrësin, jo të përkthyera nga një ditar i huaj.",
    shop: "Nga e njëjta varëse",
    related: "Rafte që e prekin temën",
    read: "Lexo",
    onlyHere:
      "Ky shënim nuk është në çdo gjuhë. Ku mungon, butoni i gjuhës hap ditarin e atij vendi, jo një artikull tjetër.",
    fallbackName: "Ditar. Nuk ka të njëjtin shënim.",
  },
};
