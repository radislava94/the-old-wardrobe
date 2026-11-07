import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { countries, countryCodes, isCountry } from "@/lib/countries";
import { journalChrome } from "@/lib/journal/chrome";
import { blogIndexLanguages } from "@/lib/journal/languages";
import { postsForCountry } from "@/lib/journal/posts";
import { getDictionary } from "@/lib/i18n";
import { blogIndexPath, blogPath, homePath } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return countryCodes.map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  if (!isCountry(country)) return {};
  const chrome = journalChrome[country];
  return pageMetadata({
    title: chrome.indexTitle,
    description: chrome.indexDescription,
    canonicalPath: blogIndexPath(country),
    languages: blogIndexLanguages(),
    locale: countries[country].ogLocale,
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  if (!isCountry(country)) notFound();
  const dict = getDictionary(country);
  const chrome = journalChrome[country];
  const posts = postsForCountry(country);
  const format = new Intl.DateTimeFormat(countries[country].intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="finds page-block">
      <div className="wrap journal">
        <Breadcrumbs
          label={dict.breadcrumbLabel}
          items={[
            { name: dict.home, path: homePath(country) },
            { name: chrome.nav, path: blogIndexPath(country) },
          ]}
        />
        <p className="eyebrow">{chrome.kicker}</p>
        <h1>{chrome.indexTitle}</h1>
        <p className="lead">{chrome.lead}</p>
        <ol className="journal-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="journal-card">
                <time dateTime={post.published}>
                  {format.format(new Date(`${post.published}T00:00:00Z`))}
                </time>
                <h2>
                  <Link href={blogPath(country, post.slug)}>{post.title}</Link>
                </h2>
                <p>{post.description}</p>
                <Link className="journal-more" href={blogPath(country, post.slug)}>
                  {chrome.read} →
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
