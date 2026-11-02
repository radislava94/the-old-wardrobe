import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyArticle } from "@/components/privacy-article";
import { isCountry } from "@/lib/countries";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: raw } = await params;
  if (!isCountry(raw)) return {};
  const dict = getDictionary(raw);
  return { title: dict.privacy.title, description: dict.privacy.intro };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: raw } = await params;
  if (!isCountry(raw)) notFound();
  const dict = getDictionary(raw);
  const privacy = dict.privacy;
  return (
    <PrivacyArticle
      title={privacy.title}
      intro={privacy.intro}
      sections={[
        { heading: privacy.whoTitle, body: privacy.whoBody },
        { heading: privacy.dataTitle, body: privacy.dataBody },
        { heading: privacy.cookiesTitle, body: privacy.cookiesBody },
        { heading: privacy.rightsTitle, body: privacy.rightsBody },
        { heading: privacy.contactTitle, body: privacy.contactBody },
      ]}
    />
  );
}
