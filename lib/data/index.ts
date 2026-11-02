import { MemoryListingRepository } from "./memory";
import type { ListingRepository } from "./repository";

export type { ListingRepository } from "./repository";

/** The only import pages should use. Replace the class, not the call sites. */
export const listingsRepo: ListingRepository = new MemoryListingRepository();
