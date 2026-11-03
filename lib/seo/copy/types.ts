export type PlaceCopy = {
  /** Document title, without the site suffix. */
  title: string;
  description: string;
  kicker: string;
  heading: string;
  emphasis: string;
  lead: string;
  paragraphs: readonly [string, string];
};
