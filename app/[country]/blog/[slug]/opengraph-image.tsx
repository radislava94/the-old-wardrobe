import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { journalCountry, postBySlug } from "@/lib/journal/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const alt = "The Old Wardrobe";

function fontFile(name: string) {
  return readFileSync(
    path.join(process.cwd(), "node_modules/@fontsource/playfair-display/files", name),
  );
}

const fonts = [
  fontFile("playfair-display-latin-700-normal.woff"),
  fontFile("playfair-display-latin-ext-700-normal.woff"),
  fontFile("playfair-display-cyrillic-700-normal.woff"),
];

export default async function JournalOgImage({
  params,
}: {
  params: Promise<{ country: string; slug: string }>;
}) {
  const { country, slug } = await params;
  const code = journalCountry(country);
  const post = code ? postBySlug(code, slug) : null;
  const title = post?.title ?? "The Old Wardrobe";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f4ecd8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 920,
            background: "#fbf6ea",
            border: "2px solid #3b2f24",
            padding: "56px 64px 48px",
            boxShadow: "16px 16px 0 #c9a14a",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: -16,
              left: 380,
              width: 160,
              height: 32,
              background: "#e3c983",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              color: "#c99a94",
              textTransform: "uppercase",
              fontFamily: "Playfair",
            }}
          >
            The Old Wardrobe
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: title.length > 48 ? 54 : 68,
              lineHeight: 1.12,
              color: "#2f4a3a",
              fontFamily: "Playfair",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              height: 8,
              width: 120,
              background: "#c99a94",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.map((data) => ({
        name: "Playfair",
        data,
        weight: 700 as const,
        style: "normal" as const,
      })),
    },
  );
}
