"use client";

import { useState } from "react";

const COOKIE = "ow_sell_guide=1; Path=/; Max-Age=31536000; SameSite=Lax";

export function PostGuide({
  show,
  copy,
  children,
}: {
  show: boolean;
  copy: {
    title: string;
    lead: string;
    start: string;
    photosTitle: string;
    photosBody: string;
    describeTitle: string;
    describeBody: string;
    priceTitle: string;
    priceBody: string;
    shipTitle: string;
    shipBody: string;
  };
  children: React.ReactNode;
}) {
  const [started, setStarted] = useState(!show);
  if (started) return children;

  const steps = [
    { title: copy.photosTitle, body: copy.photosBody },
    { title: copy.describeTitle, body: copy.describeBody },
    { title: copy.priceTitle, body: copy.priceBody },
    { title: copy.shipTitle, body: copy.shipBody },
  ];

  return (
    <section className="post-guide" aria-labelledby="post-guide-title">
      <h2 id="post-guide-title">{copy.title}</h2>
      <p className="lead">{copy.lead}</p>
      <ol>
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="n" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          document.cookie = COOKIE;
          setStarted(true);
        }}
      >
        {copy.start}
      </button>
    </section>
  );
}
