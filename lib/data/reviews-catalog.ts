import { listings, users } from "./catalog";
import type { Review } from "../types";

/**
 * Sample reviews in the seller's language. They are not submissions
 * from real buyers. See ReviewRepository for the write rule that a
 * live store must enforce: one review per completed order, from the
 * buyer on that order.
 */
export const reviews: Review[] = [
  {
    id: "r-ana-1",
    sellerId: "ana",
    buyerId: "elena",
    orderId: "ord-mk-101",
    listingId: "mk-floral",
    stars: 5,
    comment:
      "Фустанот стигна завиткан во хартија, ист како на сликата. Ана јави истиот ден кога го испрати.",
    createdAt: "2026-09-12",
    country: "mk",
  },
  {
    id: "r-ana-2",
    sellerId: "ana",
    buyerId: "boris",
    orderId: "ord-mk-102",
    listingId: "mk-poncho",
    stars: 4,
    comment:
      "Пончото е топло и полесно отколку што мислев. Една реса се разврза, Ана објасни како да ја врзам.",
    createdAt: "2026-08-03",
    country: "mk",
  },
  {
    id: "r-ana-3",
    sellerId: "ana",
    buyerId: "elena",
    orderId: "ord-mk-103",
    listingId: "mk-denim",
    stars: 5,
    comment:
      "Ги опиша фармерките искрено: омекнати, без дупки. Стигнаа за три дена до Скопје.",
    createdAt: "2026-07-19",
    country: "mk",
  },
  {
    id: "r-ile-1",
    sellerId: "ile",
    buyerId: "boris",
    orderId: "ord-mk-104",
    listingId: "mk-trench",
    stars: 5,
    comment:
      "Капутот мириса на волна, не на нафталин. Иле го спакува во кутија што не се згмечи.",
    createdAt: "2026-09-02",
    country: "mk",
  },
  {
    id: "r-ile-2",
    sellerId: "ile",
    buyerId: "elena",
    orderId: "ord-mk-105",
    listingId: "mk-maxi",
    stars: 4,
    comment:
      "Фустанот е покус отколку на сликата, ама Иле го напиша тоа. Бојата е верна.",
    createdAt: "2026-06-21",
    country: "mk",
  },
  {
    id: "r-ile-3",
    sellerId: "ile",
    buyerId: "boris",
    orderId: "ord-mk-106",
    listingId: "mk-beanie",
    stars: 3,
    comment:
      "Капата е убава, малку потесна од очекуваното. Испраќањето се одолжи една недела.",
    createdAt: "2026-05-11",
    country: "mk",
  },
  {
    id: "r-mira-1",
    sellerId: "mira",
    buyerId: "nia",
    orderId: "ord-bg-101",
    listingId: "bg-floral",
    stars: 5,
    comment:
      "Роклята дойде с лавандула в плика. Мира отговори за час и прати снимка на подгъва.",
    createdAt: "2026-09-18",
    country: "bg",
  },
  {
    id: "r-mira-2",
    sellerId: "mira",
    buyerId: "kaloyan",
    orderId: "ord-bg-102",
    listingId: "bg-poncho",
    stars: 5,
    comment:
      "Пончото е меко и точно като на снимките. Дойде сгънато в хартиен пакет.",
    createdAt: "2026-08-09",
    country: "bg",
  },
  {
    id: "r-mira-3",
    sellerId: "mira",
    buyerId: "nia",
    orderId: "ord-bg-103",
    listingId: "bg-beanie",
    stars: 4,
    comment: "Шапката не боде. Стана ми малко по-тясна, но Мира го беше написала.",
    createdAt: "2026-06-02",
    country: "bg",
  },
  {
    id: "r-petar-1",
    sellerId: "petar",
    buyerId: "kaloyan",
    orderId: "ord-bg-104",
    listingId: "bg-trench",
    stars: 4,
    comment:
      "Тренчът е тежък и топъл. Едно копче се клатеше, Петър написа как да го стегна.",
    createdAt: "2026-09-01",
    country: "bg",
  },
  {
    id: "r-petar-2",
    sellerId: "petar",
    buyerId: "nia",
    orderId: "ord-bg-105",
    listingId: "bg-denim",
    stars: 5,
    comment: "Дънките са си W30, както пише. Стигнаха за два дни до Пловдив.",
    createdAt: "2026-07-28",
    country: "bg",
  },
  {
    id: "r-petar-3",
    sellerId: "petar",
    buyerId: "kaloyan",
    orderId: "ord-bg-106",
    listingId: "bg-bomber",
    stars: 3,
    comment:
      "Якето е леко, но ластикът на едната китка е по-отпуснат, отколкото се вижда на снимката.",
    createdAt: "2026-05-30",
    country: "bg",
  },
  {
    id: "r-jovana-1",
    sellerId: "jovana",
    buyerId: "sofija",
    orderId: "ord-rs-101",
    listingId: "rs-leather",
    stars: 5,
    comment:
      "Jakna je stigla u platnenoj kesici. Koža miriše na kišu, ne na podrum. Jovana se javila čim je predala paket.",
    createdAt: "2026-09-14",
    country: "sr-rs",
  },
  {
    id: "r-jovana-2",
    sellerId: "jovana",
    buyerId: "luka",
    orderId: "ord-rs-102",
    listingId: "rs-poncho",
    stars: 5,
    comment: "Pončo je lako i tačno. Resa koja je kraća na slici kraća je i uživo.",
    createdAt: "2026-08-16",
    country: "sr-rs",
  },
  {
    id: "r-jovana-3",
    sellerId: "jovana",
    buyerId: "sofija",
    orderId: "ord-rs-103",
    listingId: "rs-maxi",
    stars: 4,
    comment:
      "Haljina se lepo kreće. Postava je malo tanja nego što sam mislila, ali opis je bio iskren.",
    createdAt: "2026-06-18",
    country: "sr-rs",
  },
  {
    id: "r-marko-1",
    sellerId: "marko",
    buyerId: "luka",
    orderId: "ord-rs-104",
    listingId: "rs-floral",
    stars: 4,
    comment:
      "Haljina je tačna veličina S. Marko je spakovao pažljivo, stigla je za četiri dana u Novi Sad.",
    createdAt: "2026-09-08",
    country: "sr-rs",
  },
  {
    id: "r-marko-2",
    sellerId: "marko",
    buyerId: "sofija",
    orderId: "ord-rs-105",
    listingId: "rs-denim",
    stars: 3,
    comment: "Farmerke jesu omekšale, ali fleka na džepu je veća nego na fotografiji.",
    createdAt: "2026-07-04",
    country: "sr-rs",
  },
  {
    id: "r-marko-3",
    sellerId: "marko",
    buyerId: "luka",
    orderId: "ord-rs-106",
    listingId: "rs-beanie",
    stars: 5,
    comment: "Kapa ne grebe. Inicijali su još tu, baš kako je napisao.",
    createdAt: "2026-05-22",
    country: "sr-rs",
  },
  {
    id: "r-era-1",
    sellerId: "era",
    buyerId: "arta",
    orderId: "ord-al-101",
    listingId: "al-trench",
    stars: 5,
    comment:
      "Palltoja erdhi e palosur në letër. Era më shkroi po atë ditë që e nisi.",
    createdAt: "2026-09-20",
    country: "sq-al",
  },
  {
    id: "r-era-2",
    sellerId: "era",
    buyerId: "genti",
    orderId: "ord-al-102",
    listingId: "al-denim",
    stars: 4,
    comment:
      "Xhinsi është W30, siç shkruan. Një xhep është më i zbehtë se në foto, dhe ajo e kishte thënë.",
    createdAt: "2026-08-01",
    country: "sq-al",
  },
  {
    id: "r-era-3",
    sellerId: "era",
    buyerId: "arta",
    orderId: "ord-al-103",
    listingId: "al-beanie",
    stars: 5,
    comment: "Kapelja nuk gërvisht. Erdhi për dy ditë në Tiranë.",
    createdAt: "2026-06-11",
    country: "sq-al",
  },
  {
    id: "r-ledi-1",
    sellerId: "ledi",
    buyerId: "genti",
    orderId: "ord-al-104",
    listingId: "al-floral",
    stars: 5,
    comment:
      "Fustani është si në foto, me një erë të lehtë livandoje. Ledi ma mati belin para se ta niste.",
    createdAt: "2026-09-05",
    country: "sq-al",
  },
  {
    id: "r-ledi-2",
    sellerId: "ledi",
    buyerId: "arta",
    orderId: "ord-al-105",
    listingId: "al-poncho",
    stars: 4,
    comment:
      "Ponçoja është e ngrohtë. Një thekë u zgjidh rrugës, Ledi më shpjegoi si ta qep.",
    createdAt: "2026-07-15",
    country: "sq-al",
  },
];

function assertReviews() {
  const userById = new Map(users.map((user) => [user.id, user]));
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));
  const orders = new Set<string>();
  const sellers = new Set(listings.map((listing) => listing.sellerId));

  for (const review of reviews) {
    if (orders.has(review.orderId)) throw new Error(`Duplicate order ${review.orderId}`);
    orders.add(review.orderId);
    if (!Number.isInteger(review.stars) || review.stars < 1 || review.stars > 5) {
      throw new Error(`Stars out of range on ${review.id}`);
    }
    const seller = userById.get(review.sellerId);
    const buyer = userById.get(review.buyerId);
    const listing = listingById.get(review.listingId);
    if (!seller || !buyer || !listing) throw new Error(`Broken review ${review.id}`);
    if (seller.id === buyer.id) throw new Error(`Self review ${review.id}`);
    if (listing.sellerId !== seller.id) throw new Error(`Listing is not this seller's on ${review.id}`);
    if (seller.country !== review.country || buyer.country !== review.country || listing.country !== review.country) {
      throw new Error(`Country mismatch on ${review.id}`);
    }
  }

  for (const sellerId of sellers) {
    if (!reviews.some((review) => review.sellerId === sellerId)) {
      throw new Error(`Seller ${sellerId} has no sample reviews`);
    }
  }
}

assertReviews();
