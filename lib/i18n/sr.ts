import type { Dictionary } from "./types";

const sr: Dictionary = {
  meta: {
    homeTitle: "Zakorači unutra",
    homeDescription:
      "Ormar za odeću iz druge ruke u Srbiji. Haljine, kaputi, trikotaža i farmerke s pričom, s cenama u dinarima.",
    categoryTitle: (category) => category,
    categoryDescription: (category) =>
      `${category} iz druge ruke u Srbiji, od prodavaca u Beogradu i Novom Sadu. Cene u dinarima.`,
    listingDescription: (title, city, price) =>
      `${title} — komad iz druge ruke iz grada ${city}, ${price}. The Old Wardrobe, Srbija.`,
    sellTitle: "Prodaj komad",
    sellDescription:
      "Pripremi oglas za odeću iz druge ruke u Srbiji. Objave stižu zajedno sa nalozima — formular još ništa ne čuva.",
    searchTitle: (query) => (query ? `Pretraga: ${query}` : "Pretraga ormara"),
    searchDescription:
      "Pretraži komade objavljene u Srbiji, u dinarima.",
    sellerTitle: (name) => name,
    sellerDescription: (name, city) =>
      `${name} prodaje odeću iz druge ruke u gradu ${city}. Ocene kupaca na The Old Wardrobe.`,
  },
  tagline: "Iz druge ruke · Osn. 2026",
  topbar:
    "✦ Besplatna dostava u zemlji za porudžbine preko 7.000 RSD · Svaki komad proveren ručno ✦",
  nav: {
    browse: "Pregledaj",
    sell: "Prodaj",
    about: "O nama",
    main: "Glavna",
  },
  searchPlaceholder: "Traži tvid, svilu, Levi's…",
  searchLabel: "Pretraži komade",
  skip: "Na sadržaj",
  hero: {
    eyebrow: "Iz druge ruke · Vintage · S ljubavlju",
    title: "Zakorači unutra.",
    titleEm: "Svaki komad ima priču.",
    lead: "Prođi pored krznenih kaputa i naftalina: iza vrata ovog ormara čekaju hiljade voljenih odevnih predmeta, spremnih za novo poglavlje.",
    browse: "Pregledaj nalaze",
    sell: "Prodaj odeću",
    imageAlt: "Šipka s vintage odećom iza lučnog vrata ormara",
    stats: [
      { value: "12.400+", label: "spašenih komada" },
      { value: "3.100", label: "prodavaca" },
      { value: "4,9 ★", label: "prosečna ocena" },
    ],
    tagTitle: "Novo ove nedelje",
    tagBody: "186 nalaza s tavana",
  },
  fresh: {
    title: "Sveže sa",
    titleEm: "tavana",
    kicker: "// tek objavljeno, birano jutros",
    seeAll: "Svi novi komadi",
  },
  placeholderNote:
    "* Komadi, veličine, cene i veliki brojevi su primeri za ovu postavku.",
  sold: "PRODATO",
  soldSmall: "· S LJUBAVLJU ·",
  sizeTag: (size) => `BR. ${size}`,
  pieces: (count) => (count === 1 ? "1 komad" : `${count} komada`),
  categories: {
    dresses: "Haljine",
    coats: "Kaputi",
    knitwear: "Trikotaža",
    denim: "Farmerke",
    accessories: "Dodaci",
  },
  how: {
    title: "Kako funkcioniše",
    sub: "Tri mala koraka, bez papira iz ministarstva.",
    steps: [
      {
        num: "01",
        title: "Objavi",
        body: "Slikaj nekoliko fotografija, dodaj veličinu i rečenicu o priči. Oglas je aktivan za manje od pet minuta.",
        hint: "→ objavljivanje je uvek besplatno",
      },
      {
        num: "02",
        title: "Pregledaj",
        body: "Šetaj pored štandera po epohi, veličini ili boji. Sačuvaj omiljeno i dobij znak kad cena padne.",
        hint: "→ novi nalazi svakog jutra",
      },
      {
        num: "03",
        title: "Kupi",
        body: "Plati bezbedno, prati pošiljku i pokloni voljenom komadu novo poglavlje. Bolje je i za planetu.",
        // TODO: "zaštita kupca" is mockup copy — no live buyer-protection product yet.
        hint: "→ zaštita kupca je uključena",
      },
    ],
  },
  quote: {
    text: "„Kupila sam kamel kaput iz sedamdesetih i u džepu našla bioskopsku kartu iz 1983. Takvo što se ne kupuje novo.“",
    cite: "— Marta, Beograd · primer utiska",
  },
  footer: {
    blurb: "Dom za odeću iz druge ruke i priče ušivene u nju.",
    shop: "Prodavnica",
    help: "Pomoć",
    newArrivals: "Novi komadi",
    howToSell: "Kako da prodaš",
    shipping: "Dostava",
    returns: "Povraćaj",
    about: "O nama",
    contact: "Kontakt",
    letterTitle: "Pismo s tavana",
    letterBody: "Nalazi jednom nedeljno, svake nedelje uz čaj.",
    emailLabel: "Imejl za pismo s tavana",
    emailPlaceholder: "tvoja@posta.rs",
    join: "Upiši",
    letterSoon:
      "Pismo se još slaže. Adresa se ne čuva — pretplata stiže kasnije.",
    rights: "© 2026 The Old Wardrobe",
    magic: "Napravljeno s pažnjom i malo magije ✦",
  },
  switcherLabel: "Zemlja",
  allCountries: "Sve zemlje",
  breadcrumbLabel: "Putanja",
  home: "Početna",
  emptyCategory: "Ovaj štand je jutros prazan. Svratite opet ili pogledajte drugi.",
  approxEur: (eur) => `≈ ${eur} po privremenom kursu`,
  listing: {
    condition: "Stanje",
    era: "Epoha",
    city: "Grad",
    seller: "Prodavac",
    memberSince: "U ormaru od",
    similar: "Još sa istog štanda",
    reserve: "Rezerviši komad",
    reserveClicked: "Ovo je samo pregled — ništa nije rezervisano.",
    reserveNote:
      "Plaćanje još nije uključeno. Dugme samo pokazuje kako će oglas izgledati.",
    available: "Dostupno",
    sold: "Prodato",
    ships: "Preuzimanje ili dostava u Srbiji",
    story: "Priča",
    share: {
      heading: "Podeli",
      instagram: "Instagram Stories",
      facebook: "Facebook",
      viber: "Viber",
      whatsapp: "WhatsApp",
      copy: "Kopiraj link",
      copied: "Kopirano",
      hint: "Facebook, Viber i WhatsApp nose link. Instagram Stories nema veb adresu — dugme daje fotografiju, onako kako je Stories prima.",
      instagramSheet:
        "Otvoreno je deljenje. Izaberi Instagram Stories — dobija fotografiju.",
      instagramLinkCopied:
        "Link je kopiran. Izaberi Instagram Stories za fotografiju, pa nalepi link u priču.",
      instagramSaved:
        "Fotografija je sačuvana, link je kopiran. Otvori Instagram i dodaj oboje u Stories.",
      instagramFailed: "Deljenje nije uspelo. Kopiraj link i pokušaj ponovo.",
      copyFailed: "Link se nije kopirao. Označi adresu u pregledaču.",
    },
  },
  sell: {
    title: "Prodaj jedan komad",
    intro:
      "Ispričaj priču i stavi cenu u dinarima. Objave stižu zajedno sa nalozima — ništa iz formulara se ne čuva.",
    name: "Naziv komada",
    namePlaceholder: "Kaput od kamel vune",
    category: "Štand",
    size: "Veličina",
    sizePlaceholder: "M, 38, W30…",
    price: "Cena",
    city: "Grad",
    story: "Priča",
    storyPlaceholder: "Odakle je, šta je preživelo, šta nedostaje.",
    photo: "Fotografija",
    photoHint: "Fotografija se vidi samo na ovom ekranu i ne šalje se nikuda.",
    submit: "Ostavi ga na pragu",
    successTitle: "Ostaje kod tebe",
    successBody: (name) =>
      `„${name}“ nije objavljen. Kad budu nalozi, ovaj oglas će moći da se sačuva.`,
    ratesNote:
      "Cena se čuva u valuti prodavca i ovde se prikazuje u dinarima. Tabela kurseva je privremena i menja se pre pravog plaćanja.",
  },
  search: {
    allTitle: "Sve u ormaru",
    empty: "Nema komada koji odgovara. Probaj drugu tkaninu ili epohu.",
    count: (count) => (count === 1 ? "1 komad" : `${count} komada`),
  },
  missing: {
    title: "Ovog komada nema u ormaru.",
    body: "Štand je pomeren ili je veza stara. Vrati se do vrata.",
    home: "Nazad do vrata",
  },
  pickerEnter: "Zakorači unutra",
  rating: {
    aria: (average, countLabel) => `Prosečna ocena ${average} od 5, ${countLabel}`,
    count: (count) => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return `${count} utisak`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} utiska`;
      return `${count} utisaka`;
    },
    reviews: "Utisci",
    breakdown: "Po ocenama",
    noReviews: "Još nema utisaka",
    listings: "Komadi iz ovog ormara",
    leaveTitle: "Ostavi utisak",
    leaveRule:
      "Utisak može da ostavi samo kupac sa završenom porudžbinom od ovog prodavca, jedan utisak po porudžbini. Nalozi još ne postoje, pa je formular zatvoren.",
    stars: "Ocena",
    comment: "Komentar",
    commentPlaceholder: "Kako je prošla kupovina?",
    submit: "Pošalji utisak",
    bought: "Za",
  },
};

export default sr;
