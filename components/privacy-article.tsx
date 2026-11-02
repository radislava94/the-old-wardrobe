import { CONTACT_EMAIL } from "@/lib/site";

export function PrivacyArticle({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <article className="page-block">
      <div className="wrap sell-layout privacy-copy">
        <p className="eyebrow">The Old Wardrobe</p>
        <h1>{title}</h1>
        <p className="lead">{intro}</p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </article>
  );
}
