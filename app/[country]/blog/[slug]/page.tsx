import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JournalAnchor } from "@/components/journal-anchor";
import { JsonLd } from "@/components/json-ld";
import { ListingCard } from "@/components/listing-card";
import { PlaceLinks } from "@/components/place-links";
import { cardsFor } from "@/lib/cards";
import { countries, countryCodes } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";
import { journalChrome } from "@/lib/journal/chrome";
import { articleLanguages } from "@/lib/journal/languages";
import { allPosts, equivalents, journalCountry, postBySlug } from "@/lib/journal/posts";
import { shopListings } from "@/lib/journal/shop";
import { blogIndexPath, blogPath, categoryPath, homePath } from "@/lib/paths";
import { absoluteUrl, articleJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((post) => ({ country: post.country, slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}): Promise<Metadata> {
  const { country, slug } = await params;
  const code = journalCountry(country);
  if (!code) return {};
  const post = postBySlug(code, slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    canonicalPath: blogPath(code, post.slug),
    languages: articleLanguages(post),
    locale: countries[code].ogLocale,
  });
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  const code = journalCountry(country);
  if (!code) notFound();
  const post = postBySlug(code, slug);
  if (!post) notFound();
  const dict = getDictionary(code);
  const chrome = journalChrome[code];
  const path = blogPath(code, post.slug);
  const format = new Intl.DateTimeFormat(countries[code].intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const items = await shopListings(code, post.categories, post.cities);
  const cards = items.length > 0 ? await cardsFor(items, code, dict) : [];
  const twins = equivalents(post.topic);
  const missingTwin = countryCodes.some(
    (other) => !twins.some((twin) => twin.country === other),
  );
  const related = post.categories.map((key) => ({
    href: categoryPath(code, key),
    name: dict.categories[key],
    detail: countries[code].nativeName,
  }));

  return (
    <article className="finds page-block">
      <div className="wrap journal">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(code) },
            { name: chrome.nav, path: blogIndexPath(code) },
            { name: post.title, path },
          ]}
        />
        <p className="eyebrow">{chrome.kicker}</p>
        <h1>{post.title}</h1>
        <p className="journal-date">
          <time dateTime={post.published}>
            {format.format(new Date(`${post.published}T00:00:00Z`))}
          </time>
        </p>
        <p className="lead">{post.description}</p>
        <div className="journal-prose">
          <MDXRemote source={post.body} components={{ a: JournalAnchor }} />
        </div>
        {missingTwin ? <p className="journal-note">{chrome.onlyHere}</p> : null}
        <PlaceLinks label={chrome.related} links={related} />
        {cards.length > 0 ? (
          <section className="journal-shop" aria-label={chrome.shop}>
            <h2>{chrome.shop}</h2>
            <div className="grid">
              {cards.map((card) => (
                <ListingCard key={card.href} {...card} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          path,
          published: post.published,
          imageUrl: absoluteUrl(`${path}/opengraph-image`),
          inLanguage: countries[code].hreflang,
        })}
      />
    </article>
  );
}
