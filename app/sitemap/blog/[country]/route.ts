import { isCountry } from "@/lib/countries";
import { countryCodes } from "@/lib/countries";
import { blogSitemapXml } from "@/lib/journal/sitemap";

export function generateStaticParams() {
  return countryCodes.map((country) => ({ country }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ country: string }> },
) {
  const { country } = await context.params;
  if (!isCountry(country)) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(blogSitemapXml(country), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
