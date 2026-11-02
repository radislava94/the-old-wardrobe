import { countries, type CountryCode } from "../countries";
import { blogIndexPath, blogPath } from "../paths";
import { absoluteUrl } from "../seo";
import { equivalents, type JournalPost } from "./posts";

/** hreflang only for posts that share `topic`. No stand-in article. */
export function articleLanguages(post: JournalPost): Record<string, string> {
  const twins = equivalents(post.topic);
  const xDefault = twins.find((twin) => twin.country === "mk") ?? post;
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(blogPath(xDefault.country, xDefault.slug)),
  };
  for (const twin of twins) {
    languages[countries[twin.country].hreflang] = absoluteUrl(
      blogPath(twin.country, twin.slug),
    );
  }
  return languages;
}

export function blogIndexLanguages(): Record<string, string> {
  const codes: CountryCode[] = ["mk", "bg", "sr-rs", "sq-al"];
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(blogIndexPath("mk")),
  };
  for (const code of codes) {
    languages[countries[code].hreflang] = absoluteUrl(blogIndexPath(code));
  }
  return languages;
}
