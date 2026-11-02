import type { Dictionary } from "./types";

const sq: Dictionary = {
  meta: {
    homeTitle: "Hyr brenda",
    homeDescription:
      "Një garderobë për rroba të dorës së dytë në Shqipëri. Fustane, pallto, trikotazh dhe xhins me histori, me çmime në lekë.",
    categoryTitle: (category) => category,
    categoryDescription: (category) =>
      `${category} të dorës së dytë në Shqipëri, nga shitës në Tiranë dhe Durrës. Çmime në lekë.`,
    listingDescription: (title, city, price) =>
      `${title} — copë e dorës së dytë nga ${city}, ${price}. The Old Wardrobe, Shqipëria.`,
    sellTitle: "Shit një copë",
    sellDescription:
      "Përgatit një shpallje për rroba të dorës së dytë në Shqipëri. Publikimi vjen bashkë me llogaritë — formulari ende nuk ruan asgjë.",
    searchTitle: (query) => (query ? `Kërkim: ${query}` : "Kërko në garderobë"),
    searchDescription:
      "Kërko copët e shpallura në Shqipëri, në lekë.",
    sellerTitle: (name) => name,
    sellerDescription: (name, city) =>
      `${name} shet rroba të dorës së dytë në ${city}. Vlerësime nga blerësit te The Old Wardrobe.`,
  },
  tagline: "Dorë e dytë · Them. 2026",
  topbar:
    "✦ Transport falas brenda vendit për porosi mbi 6.000 L · Çdo copë e kontrolluar me dorë ✦",
  nav: {
    browse: "Shfleto",
    sell: "Shit",
    about: "Rreth nesh",
    main: "Kryesore",
  },
  searchPlaceholder: "Kërko tvid, mëndafsh, Levi's…",
  searchLabel: "Kërko copë",
  skip: "Te përmbajtja",
  hero: {
    eyebrow: "Dorë e dytë · Vintage · Me dashuri",
    title: "Hyr brenda.",
    titleEm: "Çdo copë ka një histori.",
    lead: "Kalo palltot e gëzofit dhe naftalinën: pas derës së kësaj garderobe presin mijëra rroba të dashura, gati për kapitullin tjetër.",
    browse: "Shfleto gjetjet",
    sell: "Shit rrobat",
    imageAlt: "Një shufër me rroba vintage pas një dere të harkuar garderobe",
    stats: [
      { value: "12.400+", label: "copë të shpëtuara" },
      { value: "3.100", label: "shitës" },
      { value: "4,9 ★", label: "vlerësimi mesatar" },
    ],
    tagTitle: "E re këtë javë",
    tagBody: "186 gjetje nga papafingo",
  },
  fresh: {
    title: "Freskët nga",
    titleEm: "papafingo",
    kicker: "// sapo të listuara, zgjedhur këtë mëngjes",
    seeAll: "Të gjitha të rejat",
  },
  placeholderNote:
    "* Copët, masat, çmimet dhe numrat e mëdhenj janë shembuj për këtë vitrinë.",
  sold: "SHITUR",
  soldSmall: "· ME DASHURI ·",
  sizeTag: (size) => `M. ${size}`,
  pieces: (count) => (count === 1 ? "1 copë" : `${count} copë`),
  categories: {
    dresses: "Fustane",
    coats: "Pallto",
    knitwear: "Trikotazh",
    denim: "Xhins",
    accessories: "Aksesorë",
  },
  how: {
    title: "Si funksionon",
    sub: "Tri hapa të vegjël, pa letra nga ministria.",
    steps: [
      {
        num: "01",
        title: "Shpalli",
        body: "Bëj disa foto, shto masën dhe një fjali për historinë. Shpallja është gati për më pak se pesë minuta.",
        hint: "→ shpallja është gjithmonë falas",
      },
      {
        num: "02",
        title: "Shfleto",
        body: "Ec përgjatë varëseve sipas epokës, masës ose ngjyrës. Ruaj të preferuarat dhe merr një shenjë kur bie çmimi.",
        hint: "→ gjetje të reja çdo mëngjes",
      },
      {
        num: "03",
        title: "Bli",
        body: "Paguaj i qetë, ndiq paketën dhe jepi një cope të dashur kapitullin tjetër. Më mirë edhe për planetin.",
        // TODO: "mbrojtja e blerësit" është tekst i maketit — nuk ka ende një mbrojtje reale.
        hint: "→ mbrojtja e blerësit është përfshirë",
      },
    ],
  },
  quote: {
    text: "„Bleva një pallto deveje nga vitet ’70 dhe në xhep gjeta një biletë kinemaje nga 1983. Një gjë e tillë nuk blihet e re.“",
    cite: "— Marta, Tiranë · shembull komenti",
  },
  footer: {
    blurb: "Shtëpi për rroba të dorës së dytë dhe historitë e qepura në to.",
    shop: "Dyqani",
    help: "Ndihmë",
    newArrivals: "Të rejat",
    howToSell: "Si të shesësh",
    shipping: "Transporti",
    returns: "Kthimet",
    about: "Rreth nesh",
    contact: "Kontakt",
    letterTitle: "Letra nga papafingo",
    letterBody: "Gjetje një herë në javë, çdo të diel me çajin.",
    emailLabel: "Email për letrën nga papafingo",
    emailPlaceholder: "emaili@ytei.al",
    join: "Hyr",
    letterSoon:
      "Letra po radhitet ende. Adresa nuk ruhet — abonimi vjen më vonë.",
    rights: "© 2026 The Old Wardrobe",
    magic: "Bërë me kujdes dhe pak magji ✦",
  },
  switcherLabel: "Shteti",
  allCountries: "Të gjitha shtetet",
  breadcrumbLabel: "Shtegu",
  home: "Kreu",
  emptyCategory:
    "Ky stendë është bosh këtë mëngjes. Kthehu prapë ose shfleto një tjetër.",
  approxEur: (eur) => `≈ ${eur} me kurs të përkohshëm`,
  listing: {
    condition: "Gjendja",
    era: "Epoka",
    city: "Qyteti",
    seller: "Shitësi",
    memberSince: "Në garderobë nga",
    similar: "Më shumë nga i njëjti stendë",
    reserve: "Rezervo copën",
    reserveClicked: "Kjo është vetëm një parapamje — asgjë nuk është rezervuar.",
    reserveNote:
      "Pagesa ende nuk është e lidhur. Butoni vetëm tregon si do të duket shpallja.",
    available: "Në shitje",
    sold: "E shitur",
    ships: "Tërheqje ose dërgesë brenda Shqipërisë",
    story: "Historia",
    share: {
      heading: "Ndaj",
      instagram: "Instagram Stories",
      facebook: "Facebook",
      viber: "Viber",
      whatsapp: "WhatsApp",
      copy: "Kopjo lidhjen",
      copied: "U kopjua",
      hint: "Facebook, Viber dhe WhatsApp e çojnë lidhjen. Instagram Stories s’ka adresë web — butoni jep foton, ashtu siç e pranon Stories.",
      instagramSheet: "U hap ndarja. Zgjidh Instagram Stories — merr foton.",
      instagramLinkCopied:
        "Lidhja u kopjua. Zgjidh Instagram Stories për foton, pastaj ngjite lidhjen te story.",
      instagramSaved:
        "Fotoja u ruajt, lidhja u kopjua. Hap Instagramin dhe shtoji te Stories.",
      instagramFailed: "Ndarja nuk u krye. Kopjo lidhjen dhe provo sërish.",
      copyFailed: "Lidhja nuk u kopjua. Shëno adresën te shfletuesi.",
    },
  },
  sell: {
    title: "Shit një copë",
    intro:
      "Trego historinë dhe vër një çmim në lekë. Publikimi vjen bashkë me llogaritë — asgjë nga formulari nuk ruhet.",
    name: "Emri i copës",
    namePlaceholder: "Pallto prej leshi deveje",
    category: "Stenda",
    size: "Masa",
    sizePlaceholder: "M, 38, W30…",
    price: "Çmimi",
    city: "Qyteti",
    story: "Historia",
    storyPlaceholder: "Nga vjen, çfarë ka kaluar, çfarë i mungon.",
    photo: "Fotografia",
    photoHint: "Fotografia shfaqet vetëm në këtë ekran dhe nuk dërgohet askund.",
    submit: "Lëre te pragu",
    successTitle: "Mbetet te ti",
    successBody: (name) =>
      `„${name}“ nuk është publikuar. Kur të ketë llogari, kjo shpallje do të mund të ruhet.`,
    ratesNote:
      "Çmimi ruhet në monedhën e shitësit dhe këtu shfaqet në lekë. Tabela e kurseve është e përkohshme dhe zëvendësohet para pagesës së vërtetë.",
  },
  search: {
    allTitle: "Gjithçka në garderobë",
    empty: "Nuk ka copë që përputhet. Provo një pëlhurë ose epokë tjetër.",
    count: (count) => (count === 1 ? "1 copë" : `${count} copë`),
  },
  missing: {
    title: "Kjo copë nuk është në garderobë.",
    body: "Stenda është zhvendosur, ose lidhja është e vjetër. Kthehu te dera.",
    home: "Prapa te dera",
  },
  pickerEnter: "Hyr brenda",
  rating: {
    aria: (average, countLabel) => `Vlerësimi mesatar ${average} nga 5, ${countLabel}`,
    count: (count) => (count === 1 ? "1 koment" : `${count} komente`),
    reviews: "Komente",
    breakdown: "Sipas vlerësimit",
    noReviews: "Ende pa komente",
    listings: "Shpalljet e kësaj garderobe",
    leaveTitle: "Lër një koment",
    // TODO: "porosi të përfunduar" for a completed order — confirm against "porosi e kryer".
    leaveRule:
      "Një koment mund ta lërë vetëm blerësi me një porosi të përfunduar te ky shitës, një koment për çdo porosi. Llogaritë ende s'janë hapur, ndaj formulari është i mbyllur.",
    stars: "Vlerësimi",
    comment: "Komenti",
    commentPlaceholder: "Si shkoi blerja?",
    submit: "Dërgo komentin",
    bought: "Për",
  },
};

export default sq;
