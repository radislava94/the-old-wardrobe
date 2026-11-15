import { databaseEnabled } from "../db/runtime";
import { completedWelcomeSales } from "../orders/place";
import { commissionConfig } from "./config";

/** Configured welcome sales minus completed orders whose waiver was a welcome sale. */
export async function freeSalesLeftFor(sellerId: string): Promise<number> {
  if (!(await databaseEnabled())) return commissionConfig.welcomeSales;
  const used = await completedWelcomeSales(sellerId);
  return Math.max(0, commissionConfig.welcomeSales - used);
}
