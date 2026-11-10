import type { FeePreviewCopy } from "@/components/sell-form";
import type { Dictionary } from "../i18n";

/** Plain strings for the client sell form. Dictionary functions stay on the server. */
export function feePreviewCopy(dict: Dictionary, freeSalesLeft: number): FeePreviewCopy {
  return {
    freeLeft: dict.fees.freeLeft(freeSalesLeft),
    youReceivePattern: dict.fees.youReceive("{amount}"),
    enterPrice: dict.fees.enterPrice,
    platformFee: dict.fees.platformFee,
    cap: dict.fees.cap,
    courierCharge: dict.fees.courierCharge,
    courierBuyer: dict.fees.courierBuyer,
    courierSeller: dict.fees.courierSeller,
    reasons: dict.fees.reasons,
  };
}
