import type { PlaceCopy } from "@/lib/seo/copy";

export function LandingCopy({ copy }: { copy: PlaceCopy }) {
  return (
    <div className="landing">
      <p className="eyebrow">{copy.kicker}</p>
      <h1>
        {copy.heading} <em>{copy.emphasis}</em>
      </h1>
      <p className="lead">{copy.lead}</p>
      {copy.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
