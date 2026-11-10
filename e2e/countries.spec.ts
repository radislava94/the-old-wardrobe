import { expect, test } from "@playwright/test";

const sections = [
  {
    path: "/mk",
    lang: "mk",
    hreflang: "mk-MK",
    price: /ден$/,
    handChecked: "Секое парче проверено рачно",
    blog: "/mk/blog",
    blogHeading: "Дневник од гардеробата",
    article: "/mk/blog/perenje-volna",
    articleHeading: "Како да ја исперете волната без да се стегне",
  },
  {
    path: "/bg",
    lang: "bg",
    hreflang: "bg-BG",
    price: /^€/,
    handChecked: "Всяко парче е проверено на ръка",
    blog: "/bg/blog",
    blogHeading: "Дневник от гардероба",
    article: "/bg/blog/prane-na-valna",
    articleHeading: "Как да изперете вълна, без да се сплъсти",
  },
  {
    path: "/sr-rs",
    lang: "sr-Latn",
    hreflang: "sr-RS",
    price: /RSD$/,
    handChecked: "Svaki komad proveren ručno",
    blog: "/sr-rs/blog",
    blogHeading: "Dnevnik iz ormara",
    article: "/sr-rs/blog/pranje-vune",
    articleHeading: "Kako oprati vunu da se ne ućeba",
  },
  {
    path: "/sq-al",
    lang: "sq",
    hreflang: "sq-AL",
    price: / L$/,
    handChecked: "Çdo copë e kontrolluar me dorë",
    blog: "/sq-al/blog",
    blogHeading: "Ditar nga garderoba",
    article: "/sq-al/blog/larja-e-leshit",
    articleHeading: "Si ta lani leshin pa e tkurrur",
  },
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

    await expect(page.locator(".topbar")).toHaveCount(0);
    await expect(page.getByText(section.handChecked)).toHaveCount(0);

    const prices = page.locator(".price");
    await expect(prices.first()).toBeVisible();
    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(prices.nth(index)).toHaveText(section.price);
    }
  });

  test(`${section.path} journal index and one article return 200 in that language`, async ({
    page,
  }) => {
    const index = await page.goto(section.blog);
    expect(index?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", section.lang);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(section.blogHeading);

    const article = await page.goto(section.article);
    expect(article?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", section.lang);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(section.articleHeading);
  });
}
