import type { Metadata } from "next";
import { PrivacyArticle } from "@/components/privacy-article";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What The Old Wardrobe stores about an account, and how to export or delete it.",
};

const sections = [
  {
    heading: "Who we are",
    body: "The Old Wardrobe is a secondhand clothes market for North Macedonia, Bulgaria, Serbia, and Albania.",
  },
  {
    heading: "What we store",
    body: "Your name, email, and password as a hash (not as readable text), plus city, country, and a short note. If you publish a listing, we store the text and the photo. If you choose Google or Facebook, we receive the name and email they share. We do not sell this data.",
  },
  {
    heading: "Cookies",
    body: "A session cookie is set only after you sign in. Another cookie remembers this choice so we do not ask again. We do not use advertising or analytics cookies. Choosing “Accept optional” does not turn anything else on today.",
  },
  {
    heading: "Your rights",
    body: "You can download your data, correct it on the account page, and delete the account. Deletion removes the account, your listings, reviews you wrote, and reviews on your profile.",
  },
  {
    heading: "Contact",
    body: "Questions about your data:",
  },
];

export default function EnglishPrivacyPage() {
  return (
    <PrivacyArticle
      title="Privacy"
      intro="A plain account of what we keep. It is not a substitute for legal advice."
      sections={sections}
    />
  );
}
