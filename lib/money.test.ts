import { describe, expect, it } from "vitest";
import { euroEquivalent, formatEuro, formatMoney, priceFor } from "./money";

describe("formatMoney", () => {
  it("rounds to a whole unit, then formats in the country locale", () => {
    expect(formatMoney(1860, "mk")).toBe("1.860 ден");
    expect(formatMoney(1860.4, "mk")).toBe("1.860 ден");
    expect(formatMoney(1860.5, "mk")).toBe("1.861 ден");
    expect(formatMoney(1860, "bg")).toBe("€1860");
    expect(formatMoney(1_234_567, "bg")).toBe("€1\u00a0234\u00a0567");
    expect(formatMoney(1860, "sr-rs")).toBe("1.860 RSD");
    expect(formatMoney(1860, "sq-al")).toBe("1860 L");
    expect(formatMoney(1_234_567, "sq-al")).toBe("1\u00a0234\u00a0567 L");
  });

  it("prefixes the euro sign and puts other currency labels after the amount", () => {
    expect(formatMoney(11, "bg").startsWith("€")).toBe(true);
    expect(formatMoney(11, "mk").endsWith(" ден")).toBe(true);
    expect(formatMoney(11, "sr-rs").endsWith(" RSD")).toBe(true);
    expect(formatMoney(11, "sq-al").endsWith(" L")).toBe(true);
  });
});

describe("priceFor", () => {
  it("keeps a same-currency price and formats it", () => {
    expect(priceFor({ priceAmount: 1900, currency: "MKD" }, "mk")).toEqual({
      amount: 1900,
      currency: "MKD",
      formatted: "1.900 ден",
    });
  });

  it("converts into the country currency before formatting", () => {
    expect(priceFor({ priceAmount: 615, currency: "MKD" }, "bg")).toEqual({
      amount: 10,
      currency: "EUR",
      formatted: "€10",
    });
    expect(priceFor({ priceAmount: 10, currency: "EUR" }, "sq-al")).toEqual({
      amount: 980,
      currency: "ALL",
      formatted: "980 L",
    });
  });
});

describe("euro equivalent", () => {
  it("hides the equivalent when the amount is already in euros", () => {
    expect(euroEquivalent(10, "EUR")).toBeNull();
    expect(formatEuro(1860)).toBe("€1,860");
  });

  it("converts other currencies to a whole euro amount", () => {
    expect(euroEquivalent(615, "MKD")).toBe(10);
    expect(euroEquivalent(117, "RSD")).toBe(1);
    expect(formatEuro(euroEquivalent(615, "MKD") ?? 0)).toBe("€10");
  });
});
