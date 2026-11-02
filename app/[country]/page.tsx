import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryRow } from "@/components/category-row";
import { CityIndex } from "@/components/city-index";
import { ListingCard } from "@/components/listing-card";
import { categoryKeys } from "@/lib/categories";
import { cardsFor } from "@/lib/cards";
import { countries, isCountry } from "@/lib/countries";
import { listingsRepo } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { heroPhoto } from "@/lib/photos";
import { homePath, searchPath } from "@/lib/paths";
import {
  absoluteUrl,
  homeAlternatePaths,
  languageAlternates,
  pageMetadata,
} from "@/lib/seo";
import type { CategoryKey } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: raw } = await params;
  if (!isCountry(raw)) return {};
  const dict = getDictionary(raw);
  return pageMetadata({
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    canonicalPath: homePath(raw),
    languages: languageAlternates(homeAlternatePaths(), "/"),
    locale: countries[raw].ogLocale,
    image: {
      url: absoluteUrl(heroPhoto.src),
      alt: dict.hero.imageAlt,
      width: heroPhoto.width,
      height: heroPhoto.height,
    },
  });
}

export default async function CountryHome({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const items = await listingsRepo.listByCountry(raw);
  const counts = Object.fromEntries(
    categoryKeys.map((key) => [
      key,
      items.filter((item) => item.category === key).length,
    ]),
  ) as Record<CategoryKey, number>;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <p className="eyebrow">{dict.hero.eyebrow}</p>
            <h1>
              {dict.hero.title}
              <br />
              <em>{dict.hero.titleEm}</em>
            </h1>
            <p className="lead">{dict.hero.lead}</p>
            <div className="ctas">
              <a className="btn btn-primary" href="#fresh">
                {dict.hero.browse} →
              </a>
              <Link className="btn btn-ghost" href={`/${raw}/sell`}>
                {dict.hero.sell}
              </Link>
            </div>
            <div className="stats">
              {dict.hero.stats.map((stat) => (
                <div key={stat.label}>
                  <b>{stat.value}</b>
                  {stat.label}
                </div>
              ))}
            </div>
          </div>
          <div className="door">
            <span className="snow" aria-hidden="true">
              ❄
            </span>
            <div className="frame">
              <div className="shot">
                <Image
                  src={heroPhoto}
                  alt={dict.hero.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 760px) 280px, 440px"
                />
              </div>
              <span className="knob" aria-hidden="true" />
            </div>
            <div className="tag">
              <div className="ltag">
                <b>{dict.hero.tagTitle}</b>
                {dict.hero.tagBody}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoryRow country={raw} dict={dict} counts={counts} />

      <CityIndex country={raw} dict={dict} items={items} />

      <section className="finds" id="fresh">
        <div className="wrap">
          <div className="sh">
            <div>
              <h2>
                {dict.fresh.title} <em>{dict.fresh.titleEm}</em>
              </h2>
              <p>{dict.fresh.kicker}</p>
            </div>
            <Link href={searchPath(raw)}>{dict.fresh.seeAll} →</Link>
          </div>
          <div className="grid">
            {(await cardsFor(items, raw, dict)).map((card) => (
              <ListingCard key={card.href} {...card} />
            ))}
          </div>
          <p className="placeholder-note">{dict.placeholderNote}</p>
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <h2>{dict.how.title}</h2>
          <p className="sub">{dict.how.sub}</p>
          <div className="steps">
            {dict.how.steps.map((step) => (
              <article className="step" key={step.num}>
                <div className="num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <p className="hint">{step.hint}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="quote" id="story">
        <div className="wrap">
          <blockquote>
            <p>{dict.quote.text}</p>
          </blockquote>
          <cite>{dict.quote.cite}</cite>
        </div>
      </section>
    </>
  );
}
