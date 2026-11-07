import { expect, test } from "@playwright/test";

const sections = [
  { path: "/mk", lang: "mk", hreflang: "mk-MK", price: /ден$/ },
  { path: "/bg", lang: "bg", hreflang: "bg-BG", price: /^€/ },
  { path: "/sr-rs", lang: "sr-Latn", hreflang: "sr-RS", price: /RSD$/ },
  { path: "/sq-al", lang: "sq", hreflang: "sq-AL", price: / L$/ },
] as const;

for (const section of sections) {
  test(`${section.path} returns 200 with its lang, hreflang, and currency`, async ({
    page,
  }) => {
    const response = await page.goto(section.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", section.lang);

    const alternate = page.locator(
      `link[rel="alternate"][hreflang="${section.hreflang}"]`,
    );
    await expect(alternate.first()).toHaveAttribute("hreflang", section.hreflang);
    const href = await alternate.first().getAttribute("href");
    expect(href).toBeTruthy();
    expect(new URL(href!).pathname).toBe(section.path);

    const prices = page.locator(".price");
    await expect(prices.first()).toBeVisible();
    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(prices.nth(index)).toHaveText(section.price);
    }
  });
}
