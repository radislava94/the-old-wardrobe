# The Old Wardrobe

A secondhand clothes marketplace for the Balkans. One domain, four country sections, each in its own language and currency.

North Macedonia (`/mk`, Macedonian, MKD), Bulgaria (`/bg`, Bulgarian, EUR), Serbia (`/sr-rs`, Serbian in Latin script, RSD) and Albania (`/sq-al`, Albanian, ALL). The root `/` is a country picker. It never redirects by IP. A banner may suggest a country from the browser language, and the visitor still chooses the link.

The visual design lives in [`mockup/`](mockup/index.html): cream paper, faded mustard, dusty rose, forest green, Playfair Display, Courier Prime, tilted photo cards, luggage-tag sizes, a red sold stamp, and an arched wardrobe door. The mockup stays in the repo as the reference. Regenerate it with `python src/build.py`.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the public origin, with no trailing slash, before deploy. Canonical URLs, hreflang, sitemaps, Open Graph and JSON-LD all use it. On Vercel, a production deployment without that variable falls back to `VERCEL_PROJECT_PRODUCTION_URL`, and any other deployment uses `VERCEL_URL`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Country picker |
| `/{country}` | Home: door, categories, fresh listings |
| `/{country}/{category}` | Category. Slugs are localized (`/mk/fustani`, `/bg/rokli`, `/sr-rs/haljine`, `/sq-al/fustane`, and the same for coats, knitwear, denim, accessories) |
| `/{country}/listing/{slug}` | Listing. Sold pieces stay indexable |
| `/{country}/sell` | Sell form. Nothing is stored |
| `/{country}/search?q=` | Search. `noindex` |

`listing`, `sell` and `search` are reserved segments, not category slugs. The header switcher keeps the same kind of page when the country changes. A listing has no twin in another country, so the switcher goes to that country's home.

## Structure

- `app/` — App Router pages, `robots.ts`, per-country sitemaps and the sitemap index
- `components/` — header, footer, cards, forms
- `lib/i18n/` — UI dictionaries (`mk`, `bg`, `sr`, `sq`)
- `lib/data/` — `ListingRepository` and the in-memory catalog
- `lib/rates.ts` — placeholder euro rates
- `mockup/` — original static design and the source photographs
- `public/brand/` — logo used in Organization JSON-LD

Photographs are imported from `mockup/img` and served through `next/image`.

## Data

A single `User` can buy and sell. Listings point at `sellerId`. There is no separate seller account. Each listing is stored with a price in the seller's currency and a status of `available` or `sold`. A country page only loads listings whose country matches the URL. Display always runs the amount through `convert()` in `lib/rates.ts`, then formats it in the section currency.

The catalog is about 24 placeholder garments across Skopje, Bitola, Sofia, Plovdiv, Belgrade, Novi Sad, Tirana and Durrës. Swap `listingsRepo` in `lib/data/index.ts` for a Postgres (Neon) implementation of `ListingRepository` when a database exists. Call sites should not change.

## What is still placeholder

- Exchange rates in `lib/rates.ts`. They are round reference figures, marked in that file, and are not for payment. Bulgaria is euros only (the lev was replaced on 1 January 2026).
- Listings, sellers, hero statistics (12,400 pieces and the rest), the door-tag count, and the review quote.
- Accounts, checkout, favourites, the cart icons, and the attic letter. The sell form and the letter form keep what you type in the browser and then discard it.
- The contact address `hello@theoldwardrobe.example`.
- Shipping lines in the top bar illustrate the mockup's "free over about €60" sentence. They are not a delivery policy.
- Strings marked `TODO` in `lib/i18n` and `lib/rates.ts` need a native check or a live rate.

## SEO

Every indexable page sets a localized title and description, a canonical URL, Open Graph tags, and hreflang for `mk-MK`, `bg-BG`, `sr-RS`, `sq-AL` and `x-default`. Home pages use `/` as `x-default`. Category and sell pages use the Macedonian URL. A listing's own locale and `x-default` point at the listing; the other three point at the same category in that country, because the garment is not listed there.

JSON-LD:

- `Organization` and `WebSite` on every page
- `BreadcrumbList` on category, listing and sell pages
- `Product` + `Offer` on listings, with `priceCurrency` in the local currency and `availability` of `InStock` or `SoldOut`

`/sitemap.xml` is a sitemap index. `/sitemap/mk.xml`, `/sitemap/bg.xml`, `/sitemap/sr-rs.xml` and `/sitemap/sq-al.xml` list that country's URLs. Sold listings are included. Search URLs are left out and disallowed in `robots.txt`.

## Deploy

The app is a standard Next.js App Router project and deploys on Vercel with `npm run build`. No database or auth environment variables are required for this phase.
