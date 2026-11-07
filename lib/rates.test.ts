import { describe, expect, it } from "vitest";
import { convert, UNITS_PER_EUR } from "./rates";

describe("placeholder euro rates", () => {
  it("records how many units of each currency equal one euro", () => {
    expect(UNITS_PER_EUR).toEqual({
      EUR: 1,
      MKD: 61.5,
      RSD: 117,
      ALL: 98,
    });
  });

  it("returns the original amount, unrounded, when the currency does not change", () => {
    expect(convert(10.4, "MKD", "MKD")).toBe(10.4);
    expect(convert(8.13, "EUR", "EUR")).toBe(8.13);
    expect(convert(0, "RSD", "RSD")).toBe(0);
  });

  it("rounds a converted amount to a whole unit", () => {
    expect(convert(1, "EUR", "MKD")).toBe(62);
    expect(convert(1, "EUR", "RSD")).toBe(117);
    expect(convert(1, "EUR", "ALL")).toBe(98);
    expect(convert(615, "MKD", "EUR")).toBe(10);
    expect(convert(100, "MKD", "RSD")).toBe(190);
    expect(convert(100, "ALL", "MKD")).toBe(63);
    expect(convert(0, "EUR", "ALL")).toBe(0);
  });
});
