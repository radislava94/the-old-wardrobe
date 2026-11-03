# The Old Wardrobe

A secondhand clothes marketplace for the Balkans. One domain, four country sections, each in its own language and currency.

North Macedonia (`/mk`, Macedonian, MKD), Bulgaria (`/bg`, Bulgarian, EUR), Serbia (`/sr-rs`, Serbian in Latin script, RSD) and Albania (`/sq-al`, Albanian, ALL). The root `/` is a country picker. It never redirects by IP. A banner may suggest a country from the browser language, and the visitor still chooses the link.

The visual design lives in [`mockup/`](mockup/index.html): cream paper, faded mustard, dusty rose, forest green, Playfair Display, Courier Prime, tilted photo cards, luggage-tag sizes, a red sold stamp, and an arched wardrobe door. The mockup stays in the repo as the reference. Regenerate it with `python src/build.py`.

## Run

```bash
npm install
npm run dev
```

Without `DATABASE_URL`, pages read the placeholder catalog from memory. `npm run build` does not open a database connection.

Local Postgres (the same schema Neon uses in production):

```bash
docker compose up -d
cp .env.example .env.local
npm run db:setup
npm run dev
```

`db:setup` applies `drizzle/` migrations and seeds the placeholder listings, sellers, and reviews. Re-running the seed updates those rows and leaves any other rows in place.

Production build:

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the public origin, with no trailing slash, before deploy. Canonical URLs, hreflang, sitemaps, Open Graph and JSON-LD all use it. On Vercel, a production deployment without that variable falls back to `VERCEL_PROJECT_PRODUCTION_URL`, and any other deployment uses `VERCEL_URL`.

## Environment

Every variable the product knows about, and the milestone that needs it. Copy [`.env.example`](.env.example) to `.env.local`. Empty values count as unset. Do not commit `.env.local`.

| Variable | Milestone | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | foundation | Public origin, no trailing slash. |
| `DATABASE_URL` | now | Postgres. On Vercel, the Neon connection string from the Marketplace (use the pooled host, the one with `-pooler`). Locally, the docker-compose URL in `.env.example`. |
| `BETTER_AUTH_SECRET` | auth | Session signing secret. `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | auth | Origin used for auth callbacks, e.g. `http://localhost:3000`. Leave unset on Vercel Preview so each preview host is inferred. |
| `GOOGLE_CLIENT_ID` | auth | Google sign-in. The button is shown only when this and the secret are both set. |
| `GOOGLE_CLIENT_SECRET` | auth | Google sign-in secret. |
| `FACEBOOK_CLIENT_ID` | auth | Facebook sign-in. The button is shown only when this and the secret are both set. |
| `FACEBOOK_CLIENT_SECRET` | auth | Facebook sign-in secret. |
| `BLOB_READ_WRITE_TOKEN` | sell flow | Vercel Blob for listing photos. Without it, photos are saved under `public/uploads`. |
| `RESEND_API_KEY` | later email | Transactional mail. Documented only — nothing sends mail yet. |
| `EMAIL_FROM` | later email | From address for that mail. Documented only. |
| `AI_GATEWAY_API_KEY` | later AI | Key the Vercel AI SDK expects for AI Gateway. Documented only — no AI features yet. On Vercel the SDK can use the injected `VERCEL_OIDC_TOKEN` instead. |

`VERCEL_URL`, `VERCEL_ENV`, and `VERCEL_PROJECT_PRODUCTION_URL` are set by Vercel. They are not part of `.env.example`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Country picker |
| `/{country}` | Home: door, categories, fresh listings |
| `/{country}/{category}` | Category. Slugs are localized (`/mk/fustani`, `/bg/rokli`, `/sr-rs/haljine`, `/sq-al/fustane`, and the same for coats, knitwear, denim, accessories) |
| `/{country}/{category}/{city}` | Category in one city. City slugs are latin: `/mk/fustani/skopje`, `/mk/fustani/bitola`, `/bg/rokli/sofia`, `/bg/rokli/plovdiv`, `/sr-rs/haljine/beograd`, `/sr-rs/haljine/novi-sad`, `/sq-al/fustane/tirane`, `/sq-al/fustane/durres`, and the same city slug on every category |
| `/{country}/listing/{slug}` | Listing. Sold pieces stay indexable |
| `/{country}/seller/{handle}` | Seller profile: rating, listings, reviews |
| `/{country}/sell` | Sell form. Nothing is stored |
| `/{country}/search?q=` | Search. `noindex` |

`listing`, `sell` and `search` are reserved segments, not category slugs. The header switcher keeps the same kind of page when the country changes. A listing has no twin in another country, so the switcher goes to that country's home.

## Structure

- `app/` — App Router pages, `robots.ts`, per-country sitemaps and the sitemap index
- `components/` — header, footer, cards, forms
- `lib/i18n/` — UI dictionaries (`mk`, `bg`, `sr`, `sq`)
- `lib/data/` — `ListingRepository` and `ReviewRepository`. Postgres when `DATABASE_URL` is set, otherwise the in-memory catalog
- `lib/db/` — Drizzle schema and a lazy Postgres client
- `drizzle/` — SQL migrations
- `scripts/` — `db:migrate` and `db:seed`
- `lib/rates.ts` — placeholder euro rates
- `mockup/` — original static design and the source photographs
- `public/brand/` — logo used in Organization JSON-LD

Photographs are imported from `mockup/img` and served through `next/image`.

## Data

A single `User` can buy and sell. Listings point at `sellerId`. There is no separate seller account. Each listing is stored with a price in the seller's currency and a status of `available` or `sold`. A country page only loads listings whose country matches the URL. Display always runs the amount through `convert()` in `lib/rates.ts`, then formats it in the section currency.

The catalog is about 24 placeholder garments across Skopje, Bitola, Sofia, Plovdiv, Belgrade, Novi Sad, Tirana and Durrës. `npm run db:setup` copies those listings, sellers, and reviews into Postgres. Call sites still use `listingsRepo` and `reviewsRepo`. The client is created on first query, so a build with no database does not connect. Seeded reviews are sample copy: `first_party` is false, and `areFirstParty()` stays false.

Every seller is the same `User` type. Buyers rate that person after a purchase. The average and the star breakdown are computed from `Review` rows (`stars` is a whole number from 1 to 5; the row of stars rounds the mean to the nearest half). A future write path must refuse a review unless the buyer has a completed order from that seller, and must allow only one review per order. The sample reviews are not that. `reviewsRepo.areFirstParty()` returns false, and the profile JSON-LD therefore omits `aggregateRating`.

## What is still placeholder

- Exchange rates in `lib/rates.ts`. They are round reference figures, marked in that file, and are not for payment. Bulgaria is euros only (the lev was replaced on 1 January 2026).
- Listings, sellers, the sample seller reviews, hero statistics (12,400 pieces and the rest), the door-tag count, and the homepage quote. The "leave a review" form is disabled until accounts exist.
- Accounts, checkout, favourites, the cart icons, and the attic letter. The sell form and the letter form keep what you type in the browser and then discard it.
- The contact address `hello@theoldwardrobe.example`.
- Shipping lines in the top bar illustrate the mockup's "free over about €60" sentence. They are not a delivery policy.
- Strings marked `TODO` in `lib/i18n` and `lib/rates.ts` need a native check or a live rate.

## SEO

Every indexable page sets a localized title and description, a canonical URL, Open Graph tags, and hreflang for `mk-MK`, `bg-BG`, `sr-RS`, `sq-AL` and `x-default`. Home pages use `/` as `x-default`. Category and sell pages use the Macedonian URL. A listing's own locale and `x-default` point at the listing; the other three point at the same category in that country, because the garment is not listed there.

A category-and-city page is about that city only. Its own locale and `x-default` point at the city URL. The other three locales point at the same category in that country, because Skopje is not a translated page of Sofia. The canonical URL is the city page itself. Copy is written per country, category, and city. The grid shows only listings whose city matches, read through `listingsRepo`.

A seller profile's own locale and `x-default` point at that profile. The other three locales point at the country home, because that person does not sell there.

JSON-LD:

- `Organization` and `WebSite` on every page
- `BreadcrumbList` on category, listing, sell, and seller pages
- `Product` + `Offer` on listings, with `priceCurrency` in the local currency and `availability` of `InStock` or `SoldOut`. Seller reviews are not added as `aggregateRating` on the product
- `Person` on seller profiles. `aggregateRating` is included only when `reviewsRepo.areFirstParty()` is true, which matches Google's rule that review stars in structured data come from ratings the site collected itself. The sample copy leaves it out

`/sitemap.xml` is a sitemap index. `/sitemap/mk.xml`, `/sitemap/bg.xml`, `/sitemap/sr-rs.xml` and `/sitemap/sq-al.xml` list that country's URLs, including each category-and-city landing. Sold listings are included. Search URLs are left out and disallowed in `robots.txt`.

## Deploy

The app is a standard Next.js App Router project and deploys on Vercel with `npm run build`. The build does not require `DATABASE_URL`. Set it to the Neon connection string before a running deployment should read Postgres, then run the migrations and seed against that database.
