import { describe, expect, it } from "vitest";
import { getDictionary } from "./index";
import { countryCodes } from "../countries";

const buyerProtection = /заштита за купувачот|защитата на купувача|zaštita kupca|mbrojtja e blerësit/i;
const pickup = /подигнување|вземане|preuzimanje|tërheqje/i;
const paymentOff = /плаќањето сè уште не е вклучено|плащането още не е включено|plaćanje još nije|pagesa ende nuk/i;

describe("shop copy", () => {
  it("does not promise buyer protection or a tracked parcel", () => {
    for (const code of countryCodes) {
      const step = getDictionary(code).how.steps[2];
      expect(step?.hint ?? "").not.toMatch(buyerProtection);
      expect(step?.body ?? "").not.toMatch(/след|прослед|prati pošiljku|ndiq paket/i);
      expect(step?.body ?? "").toMatch(/курир|куриер|kurir|korrier/i);
    }
  });

  it("says the seller sends the parcel by courier", () => {
    for (const code of countryCodes) {
      const ships = getDictionary(code).listing.ships;
      expect(ships).not.toMatch(pickup);
      expect(ships).toMatch(/курир|куриер|kurir|korrier/i);
    }
  });

  it("names a new seller when there are no buyer ratings", () => {
    for (const code of countryCodes) {
      const line = getDictionary(code).rating.newSeller;
      expect(line.trim().length).toBeGreaterThan(8);
    }
  });

  it("offers a create-account line on the sign-in copy", () => {
    expect(getDictionary("mk").auth.signUpTitle).toBe("Креирај сметка");
    expect(getDictionary("mk").auth.switchToSignUp).toBe("Немаш сметка? Креирај сметка");
    expect(getDictionary("mk").sell.flow.photosTitle).toBe("Додај фотографии");
    expect(getDictionary("mk").sell.flow.photosProgress).toContain("од 8");
  });

  it("keeps a sign-in line for cash on delivery", () => {
    for (const code of countryCodes) {
      const order = getDictionary(code).order;
      expect(order.signIn.trim().length).toBeGreaterThan(0);
      expect(order.signIn).not.toMatch(paymentOff);
    }
  });
});
