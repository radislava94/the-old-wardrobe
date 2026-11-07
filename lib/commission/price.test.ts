import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { CurrencyCode } from "../types";

/**
 * Seller commission is not on main yet. Checkout adds `lib/commission/price.ts`.
 * Until that file exists, this suite skips so `npm test` stays green on main.
 */

type RateReason = "launch_promo" | "welcome_sale" | "under_threshold" | "standard";

type PricedCommission = {
  merchandiseTotal: number;
  commissionAmount: number;
  sellerPayoutAmount: number;
  commissionRate: number;
  thresholdAmount: number;
  capAmount: number;
  rateReason: RateReason;
  currency: CurrencyCode;
};

type CommissionModule = {
  priceCommission: (input: {
    merchandiseTotal: number;
    currency: CurrencyCode;
    completedWelcomeSales: number;
    today?: string;
  }) => PricedCommission;
  commissionConfig: {
    launchPromo: { enabled: boolean; endsOn: string | null };
    welcomeSales: number;
    rate: number;
    threshold: Record<CurrencyCode, number>;
    cap: Record<CurrencyCode, number>;
  };
};

async function loadCommission(): Promise<CommissionModule | null> {
  const priceFile = path.resolve(process.cwd(), "lib/commission/price.ts");
  const configFile = path.resolve(process.cwd(), "lib/commission/config.ts");
  if (!existsSync(priceFile) || !existsSync(configFile)) return null;

  const [price, config] = await Promise.all([
    import(/* @vite-ignore */ pathToFileURL(priceFile).href),
    import(/* @vite-ignore */ pathToFileURL(configFile).href),
  ]);
  return {
    priceCommission: price.priceCommission,
    commissionConfig: config.commissionConfig,
  };
}

const commission = await loadCommission();

describe.skipIf(commission === null)("seller commission", () => {
  if (commission === null) {
    it.skip("waits for lib/commission/price.ts from checkout", () => {});
    return;
  }

  const { priceCommission, commissionConfig } = commission;
  const originalPromo = {
    enabled: commissionConfig.launchPromo.enabled,
    endsOn: commissionConfig.launchPromo.endsOn,
  };

  afterEach(() => {
    commissionConfig.launchPromo.enabled = originalPromo.enabled;
    commissionConfig.launchPromo.endsOn = originalPromo.endsOn;
  });

  function promoOff() {
    commissionConfig.launchPromo.enabled = false;
    commissionConfig.launchPromo.endsOn = null;
  }

  it("keeps the suggested rates in config", () => {
    expect(commissionConfig.rate).toBe(0.05);
    expect(commissionConfig.welcomeSales).toBe(3);
    expect(commissionConfig.threshold).toEqual({
      MKD: 500,
      EUR: 8.13,
      RSD: 950,
      ALL: 740,
    });
    expect(commissionConfig.cap).toEqual({
      MKD: 600,
      EUR: 9.76,
      RSD: 1140,
      ALL: 890,
    });
  });

  it("charges nothing during the launch promo, even on a large first sale", () => {
    commissionConfig.launchPromo.enabled = true;
    commissionConfig.launchPromo.endsOn = null;
    const priced = priceCommission({
      merchandiseTotal: 20_000,
      currency: "MKD",
      completedWelcomeSales: 0,
    });
    expect(priced).toMatchObject({
      rateReason: "launch_promo",
      commissionAmount: 0,
      commissionRate: 0,
      sellerPayoutAmount: 20_000,
      merchandiseTotal: 20_000,
    });
  });

  it("treats the promo end date as still active on that day", () => {
    commissionConfig.launchPromo.enabled = true;
    commissionConfig.launchPromo.endsOn = "2026-11-01";
    const onTheDay = priceCommission({
      merchandiseTotal: 20_000,
      currency: "MKD",
      completedWelcomeSales: 3,
      today: "2026-11-01",
    });
    const nextDay = priceCommission({
      merchandiseTotal: 20_000,
      currency: "MKD",
      completedWelcomeSales: 3,
      today: "2026-11-02",
    });
    expect(onTheDay.rateReason).toBe("launch_promo");
    expect(onTheDay.commissionAmount).toBe(0);
    expect(nextDay.rateReason).toBe("standard");
    expect(nextDay.commissionAmount).toBe(600);
    expect(nextDay.sellerPayoutAmount).toBe(19_400);
  });

  it("uses a welcome sale only at or above the threshold, and only after the promo", () => {
    promoOff();
    const below = priceCommission({
      merchandiseTotal: 499,
      currency: "MKD",
      completedWelcomeSales: 0,
    });
    const atThreshold = priceCommission({
      merchandiseTotal: 500,
      currency: "MKD",
      completedWelcomeSales: 0,
    });
    const large = priceCommission({
      merchandiseTotal: 20_000,
      currency: "MKD",
      completedWelcomeSales: 2,
    });
    expect(below).toMatchObject({
      rateReason: "under_threshold",
      commissionAmount: 0,
      sellerPayoutAmount: 499,
    });
    expect(atThreshold).toMatchObject({
      rateReason: "welcome_sale",
      commissionAmount: 0,
      sellerPayoutAmount: 500,
    });
    expect(large).toMatchObject({
      rateReason: "welcome_sale",
      commissionAmount: 0,
      sellerPayoutAmount: 20_000,
    });
  });

  it("does not use a welcome sale once the configured count is spent", () => {
    promoOff();
    const priced = priceCommission({
      merchandiseTotal: 500,
      currency: "MKD",
      completedWelcomeSales: commissionConfig.welcomeSales,
    });
    expect(priced).toMatchObject({
      rateReason: "standard",
      commissionRate: 0.05,
      commissionAmount: 25,
      sellerPayoutAmount: 475,
    });
  });

  it("charges 5 percent of a standard sale, capped in each currency", () => {
    promoOff();
    expect(
      priceCommission({
        merchandiseTotal: 11_980,
        currency: "MKD",
        completedWelcomeSales: 3,
      }),
    ).toMatchObject({
      rateReason: "standard",
      commissionAmount: 599,
      sellerPayoutAmount: 11_381,
    });
    expect(
      priceCommission({
        merchandiseTotal: 20_000,
        currency: "MKD",
        completedWelcomeSales: 3,
      }),
    ).toMatchObject({
      rateReason: "standard",
      commissionAmount: 600,
      sellerPayoutAmount: 19_400,
    });
    expect(
      priceCommission({
        merchandiseTotal: 1000,
        currency: "EUR",
        completedWelcomeSales: 3,
      }),
    ).toMatchObject({
      rateReason: "standard",
      commissionAmount: 9.76,
      sellerPayoutAmount: 990.24,
    });
    expect(
      priceCommission({
        merchandiseTotal: 30_000,
        currency: "RSD",
        completedWelcomeSales: 3,
      }),
    ).toMatchObject({
      rateReason: "standard",
      commissionAmount: 1140,
      sellerPayoutAmount: 28_860,
    });
    expect(
      priceCommission({
        merchandiseTotal: 20_000,
        currency: "ALL",
        completedWelcomeSales: 3,
      }),
    ).toMatchObject({
      rateReason: "standard",
      commissionAmount: 890,
      sellerPayoutAmount: 19_110,
    });
  });

  it("rounds euro merchandise to cents before comparing with the threshold", () => {
    promoOff();
    const justUnder = priceCommission({
      merchandiseTotal: 8.124,
      currency: "EUR",
      completedWelcomeSales: 0,
    });
    const roundsUpToThreshold = priceCommission({
      merchandiseTotal: 8.125,
      currency: "EUR",
      completedWelcomeSales: 0,
    });
    expect(justUnder).toMatchObject({
      merchandiseTotal: 8.12,
      rateReason: "under_threshold",
      commissionAmount: 0,
    });
    expect(roundsUpToThreshold).toMatchObject({
      merchandiseTotal: 8.13,
      rateReason: "welcome_sale",
      commissionAmount: 0,
      sellerPayoutAmount: 8.13,
    });
  });
});
