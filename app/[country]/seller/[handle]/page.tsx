import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";
import { cardsFor } from "@/lib/cards";
import { countries, isCountry } from "@/lib/countries";
import { listings, users } from "@/lib/data/catalog";
import { listingsRepo, reviewsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { homePath, listingPath, sellerPath } from "@/lib/paths";
import { formatRating, starScores, summarize } from "@/lib/ratings";
import {
  absoluteUrl,
  languageAlternates,
  pageMetadata,
  sellerAlternatePaths,
  sellerJsonLd,
} from "@/lib/seo";

export function generateStaticParams() {
  const sellerIds = new Set(listings.map((listing) => listing.sellerId));
  return users
    .filter((user) => sellerIds.has(user.id))
    .map((user) => ({ country: user.country, handle: user.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; handle: string }>;
}): Promise<Metadata> {
  const { country: raw, handle } = await params;
  if (!isCountry(raw)) return {};
  const user = await listingsRepo.getUserByHandle(raw, handle);
  if (!user) return {};
  const dict = getDictionary(raw);
  return pageMetadata({
    title: dict.meta.sellerTitle(user.name),
    description: dict.meta.sellerDescription(user.name, user.city),
    canonicalPath: sellerPath(raw, user.handle),
    languages: languageAlternates(sellerAlternatePaths(user), sellerPath(raw, user.handle)),
    locale: countries[raw].ogLocale,
    image: {
      url: absoluteUrl(heroPhoto.src),
      alt: dict.hero.imageAlt,
      width: heroPhoto.width,
      height: heroPhoto.height,
    },
  });
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ country: string; handle: string }>;
}) {
  const { country: raw, handle } = await params;
  if (!isCountry(raw)) notFound();
  const user = await listingsRepo.getUserByHandle(raw, handle);
  if (!user) notFound();

  const [all, reviewList, firstParty] = await Promise.all([
    listingsRepo.listByCountry(raw),
    reviewsRepo.listBySeller(user.id),
    reviewsRepo.areFirstParty(),
  ]);
  const items = all.filter((listing) => listing.sellerId === user.id);
  if (items.length === 0) notFound();

  const dict = getDictionary(raw);
  const summary = summarize(reviewList);
  const locale = countries[raw].intlLocale;
  const figure = summary.count ? formatRating(summary.average, locale) : "";
  const joined = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${user.memberSince}T00:00:00Z`));
  const path = sellerPath(raw, user.handle);
  const cards = await cardsFor(items, raw, dict);
  const titles = new Map(all.map((listing) => [listing.id, listing]));
  const maxBar = Math.max(1, ...starScores().map((score) => summary.breakdown[score]));

  return (
    <article className="page-block">
      <div className="wrap">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(raw) },
            { name: user.name, path },
          ]}
        />
        <header className="seller-hero">
          <Avatar name={user.name} />
          <div>
            <p className="eyebrow">{dict.listing.seller}</p>
            <h1>{user.name}</h1>
            <p className="seller-place">
              {user.city}
              <span aria-hidden="true"> · </span>
              {dict.listing.memberSince} {joined}
            </p>
            <p className="story">{user.bio}</p>
            <Stars
              summary={summary}
              figure={figure}
              size="lg"
              label={
                summary.count
                  ? dict.rating.aria(figure, dict.rating.count(summary.count))
                  : dict.rating.noReviews
              }
            />
            {summary.count === 0 ? <p className="hint">{dict.rating.noReviews}</p> : null}
          </div>
          {summary.count > 0 ? (
            <div className="breakdown">
              <h2>{dict.rating.breakdown}</h2>
              <ol>
                {starScores().map((score) => {
                  const count = summary.breakdown[score];
                  return (
                    <li key={score}>
                      <span>{score}</span>
                      <span className="bar" aria-hidden="true">
                        <span style={{ width: `${(count / maxBar) * 100}%` }} />
                      </span>
                      <span>{count}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </header>

        <section className="seller-listings">
          <h2>{dict.rating.listings}</h2>
          <div className="grid">
            {cards.map((card) => (
              <ListingCard key={card.href} {...card} />
            ))}
          </div>
        </section>

        <section className="seller-reviews">
          <h2>{dict.rating.reviews}</h2>
          <ol className="review-list">
            {await Promise.all(
              reviewList.map(async (review) => {
                const buyer = await listingsRepo.getUser(review.buyerId);
                const piece = titles.get(review.listingId);
                const when = new Intl.DateTimeFormat(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${review.createdAt}T00:00:00Z`));
                const one = summarize([{ stars: review.stars }]);
                return (
                  <li key={review.id}>
                    <Stars
                      summary={one}
                      figure={String(review.stars)}
                      compact
                      label={dict.rating.aria(
                        formatRating(review.stars, locale),
                        dict.rating.count(1),
                      )}
                    />
                    <blockquote>
                      <p>{review.comment}</p>
                    </blockquote>
                    <p className="review-by">
                      {buyer?.name ?? dict.listing.seller}
                      <span aria-hidden="true"> · </span>
                      <time dateTime={review.createdAt}>{when}</time>
                      {piece ? (
                        <>
                          <span aria-hidden="true"> · </span>
                          {dict.rating.bought}{" "}
                          <Link href={listingPath(raw, piece.slug)}>{piece.title}</Link>
                        </>
                      ) : null}
                    </p>
                  </li>
                );
              }),
            )}
          </ol>
          <ReviewForm
            title={dict.rating.leaveTitle}
            rule={dict.rating.leaveRule}
            stars={dict.rating.stars}
            comment={dict.rating.comment}
            commentPlaceholder={dict.rating.commentPlaceholder}
            submit={dict.rating.submit}
          />
        </section>
      </div>
      <JsonLd
        data={sellerJsonLd({
          user,
          path,
          summary,
          firstParty,
        })}
      />
    </article>
  );
}
