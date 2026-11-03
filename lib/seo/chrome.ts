import type { CountryCode } from "../countries";

export type SeoChrome = {
  byCity: string;
  sameCity: string;
  otherCity: string;
  wholeRail: string;
  emptyRail: string;
  placesTitle: string;
  placesLead: string;
};

export const seoChrome: Record<CountryCode, SeoChrome> = {
  mk: {
    byCity: "По град",
    sameCity: "Во истиот град",
    otherCity: "И во другиот град",
    wholeRail: "Целата полица",
    emptyRail:
      "Овој штанд е празен утрово. Огласи од другиот град не се префрлаат тука за да изгледа полно.",
    placesTitle: "Два града, одделни полици",
    placesLead:
      "Скопје и Битола не делат закачалка. Фустанот од Дебар Маало не се меша со капутот од Широк Сокак.",
  },
  bg: {
    byCity: "По град",
    sameCity: "В същия град",
    otherCity: "И в другия град",
    wholeRail: "Целият щанд",
    emptyRail:
      "Този щанд е празен тази сутрин. Обява от другия град не се премества тук, за да изглежда пълно.",
    placesTitle: "Два града, отделни щандове",
    placesLead:
      "София и Пловдив си пазят щандовете. Роклята от жълтите павета не стои до пловдивския тренч.",
  },
  "sr-rs": {
    byCity: "Po gradu",
    sameCity: "U istom gradu",
    otherCity: "I u drugom gradu",
    wholeRail: "Cela polica",
    emptyRail:
      "Ovaj štand je jutros prazan. Oglasi iz drugog grada ne prelaze ovde da popune mesto.",
    placesTitle: "Dva grada, odvojene police",
    placesLead:
      "Beograd i Novi Sad ne mešaju oglase. Haljina sa Dorćola nije isti štand kao farmerke s Limana.",
  },
  "sq-al": {
    byCity: "Sipas qytetit",
    sameCity: "Në të njëjtin qytet",
    otherCity: "Edhe në qytetin tjetër",
    wholeRail: "I gjithë rafti",
    emptyRail:
      "Ky stendë është bosh këtë mëngjes. Njoftimet e qytetit tjetër nuk vihen këtu për ta mbushur.",
    placesTitle: "Dy qytete, rafte të ndara",
    placesLead:
      "Tirana dhe Durrësi i mbajnë njoftimet veç. Fustani i Bllokut nuk zë vendin e palltos së Durrësit.",
  },
};
