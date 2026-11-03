import { isCountry } from "@/lib/countries";
import { countrySitemapXml } from "@/lib/sitemap-xml";

export function generateStaticParams() {
  return [{ country: "mk" }, { country: "bg" }, { country: "sr-rs" }, { country: "sq-al" }];
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ country: string }> },
) {
  const { country } = await context.params;
  if (!isCountry(country)) {
    return new Response("Not Found", { status: 404 });
  }
  const xml = await countrySitemapXml(country);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
