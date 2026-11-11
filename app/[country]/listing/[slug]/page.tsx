import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { ReserveButton } from "@/components/reserve-button";
import { ShareRow } from "@/components/share-row";
import { Stars } from "@/components/stars";
import { cardsFor } from "@/lib/cards";
import { countries, isCountry } from "@/lib/countries";
import { listings } from "@/lib/data/catalog";
import { listingsRepo, reviewsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { euroEquivalent, formatEuro, formatListingPrice, priceFor } from "@/lib/money";
import { photos } from "@/lib/photos";
import { categoryPath, homePath, listingPath, sellerPath } from "@/lib/paths";
import { shippingLabels } from "@/lib/listings/shipping-label";
import { emptySummary, formatRating } from "@/lib/ratings";
import {
  absoluteUrl,
  languageAlternates,
  listingAlternatePaths,
  pageMetadata,
  productJsonLd,
} from "@/lib/seo";
import type { Listing } from "@/lib/types";

export const dynamicParams = true;

export function generateStaticParams() {
  return listings.map((listing) => ({
    country: listing.country,
    slug: listing.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}): Promise<Metadata> {
  const { country: raw, slug } = await params;
  if (!isCountry(raw)) return {};
  const listing = await listingsRepo.getBySlug(raw, slug);
  if (!listing) return {};
  const dict = getDictionary(raw);
  const price = priceFor(listing, raw);
  const path = listingPath(raw, listing.slug);
  return pageMetadata({
    title: listing.title,
    description: dict.meta.listingDescription(listing.title, listing.city, price.formatted),
    canonicalPath: path,
    languages: languageAlternates(listingAlternatePaths(listing), path),
    locale: countries[raw].ogLocale,
    image: {
      url: absoluteUrl(`${path}/opengraph-image`),
      alt: listing.title,
      width: 1200,
      height: 630,
    },
  });
}

function related(listing: Listing, all: Listing[]): Listing[] {
  const others = all.filter((item) => item.id !== listing.id);
  const same = others.filter((item) => item.category === listing.category);
  const rest = others.filter((item) => item.category !== listing.category);
  return [...same, ...rest].slice(0, 4);
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country: raw, slug } = await params;
  if (!isCountry(raw)) notFound();
  const listing = await listingsRepo.getBySlug(raw, slug);
  if (!listing) notFound();

  const dict = getDictionary(raw);
  const [seller, all, summaries] = await Promise.all([
    listingsRepo.getUser(listing.sellerId),
    listingsRepo.listByCountry(raw),
    reviewsRepo.summariesFor([listing.sellerId]),
  ]);
  const summary = summaries[listing.sellerId] ?? emptySummary();
  const ratingFigure = summary.count
    ? formatRating(summary.average, countries[raw].intlLocale)
    : "";
  const price = priceFor(listing, raw);
  const approx = euroEquivalent(listing.priceAmount, listing.currency);
  const image = listing.photoUrl || photos[listing.photo];
  const imageUrl = listing.photoUrl
    ? listing.photoUrl.startsWith("http")
      ? listing.photoUrl
      : absoluteUrl(listing.photoUrl)
    : absoluteUrl(photos[listing.photo].src);
  const path = listingPath(raw, listing.slug);
  const categoryName = dict.categories[listing.category];
  const joined = seller
    ? new Intl.DateTimeFormat(countries[raw].intlLocale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${seller.memberSince}T00:00:00Z`))
    : "";

  return (
    <article className="page-block">
      <div className="wrap">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(raw) },
            { name: categoryName, path: categoryPath(raw, listing.category) },
            { name: listing.title, path },
          ]}
        />
        <div className="detail">
          <div className={listing.status === "sold" ? "polaroid sold" : "polaroid"}>
            <span className="size">{dict.sizeTag(listing.size)}</span>
            <div className="ph">
              <Image
                src={image}
                alt={listing.title}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 540px"
              />
              {listing.status === "sold" ? (
                <span className="stamp">
                  {dict.sold}
                  <small>{dict.soldSmall}</small>
                </span>
              ) : null}
            </div>
          </div>
          <div className="detail-copy">
            <p className="eyebrow">
              {categoryName} · {listing.city}
            </p>
            <h1>{listing.title}</h1>
            <p className={`price price-lg${listing.status === "sold" ? " is-sold" : ""}`}>
              {price.formatted}
            </p>
            {approx !== null ? (
              <p className="approx">{dict.approxEur(formatEuro(approx))}</p>
            ) : null}
            <p className="status-line">
              {listing.status === "sold" ? dict.listing.sold : dict.listing.available}
              {" · "}
              {dict.listing.ships}
            </p>
            <ShareRow
              title={listing.title}
              price={
                listing.status === "sold"
                  ? `${formatListingPrice(listing.priceAmount, listing.currency)} · ${dict.listing.sold}`
                  : formatListingPrice(listing.priceAmount, listing.currency)
              }
              pageUrl={absoluteUrl(path)}
              imagePath={`${path}/opengraph-image`}
              fileName={`the-old-wardrobe-${listing.slug}.png`}
              labels={dict.listing.share}
            />
            <p className="ship-note">
              {shippingLabels(listing, dict).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <h2>{dict.listing.story}</h2>
            <p className="story">{listing.description}</p>
            <dl className="facts">
              <div>
                <dt>{dict.listing.era}</dt>
                <dd>{listing.era}</dd>
              </div>
              <div>
                <dt>{dict.listing.condition}</dt>
                <dd>{listing.condition}</dd>
              </div>
              <div>
                <dt>{dict.listing.city}</dt>
                <dd>{listing.city}</dd>
              </div>
              <div>
                <dt>{dict.sell.size}</dt>
                <dd>{listing.size}</dd>
              </div>
              {listing.brand ? (
                <div>
                  <dt>{dict.sell.brand}</dt>
                  <dd>{listing.brand}</dd>
                </div>
              ) : null}
            </dl>
            <p className="status-line">
              {seller?.sellerKind === "business"
                ? dict.listing.sellerBusiness
                : dict.listing.sellerPrivate}
            </p>
            {seller?.sellerKind === "business" ? null : (
              <p className="returns-note">{dict.listing.returnsPrivate}</p>
            )}
            {seller ? (
              <Link href={sellerPath(raw, seller.handle)} className="seller-card">
                <div className="seller-top">
                  <Avatar name={seller.name} />
                  <div>
                    <h2>{dict.listing.seller}</h2>
                    <p className="seller-name">{seller.name}</p>
                    <Stars
                      summary={summary}
                      figure={ratingFigure}
                      label={
                        summary.count
                          ? dict.rating.aria(ratingFigure, dict.rating.count(summary.count))
                          : dict.rating.noReviews
                      }
                    />
                  </div>
                </div>
                <p>{seller.bio}</p>
                <p className="hint">
                  {dict.listing.memberSince} {joined}
                </p>
              </Link>
            ) : null}
            {listing.status === "available" ? (
              <ReserveButton
                label={dict.listing.reserve}
                note={dict.listing.reserveNote}
                clicked={dict.listing.reserveClicked}
              />
            ) : (
              <p className="hint">{dict.listing.sold}</p>
            )}
          </div>
        </div>

        <section className="similar">
          <h2>{dict.listing.similar}</h2>
          <div className="grid">
            {(await cardsFor(related(listing, all), raw, dict)).map((card) => (
              <ListingCard key={card.href} {...card} />
            ))}
          </div>
        </section>
      </div>
      <JsonLd
        data={productJsonLd({
          listing,
          description: listing.description,
          price: price.amount,
          currency: price.currency,
          imageUrl,
          path,
        })}
      />
    </article>
  );
}
