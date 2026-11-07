import type { CountryCode } from "../countries";
import type { CategoryKey, CurrencyCode } from "../types";

export type PhotoStatus = "pending" | "ready" | "failed" | "deleted";

export type Visibility = "draft" | "public" | "sold";

export type PhotoCode =
  | "photo-type"
  | "photo-size"
  | "photo-count"
  | "photo-incomplete"
  | "photo-foreign"
  | "photo-missing"
  | "photo-spoofed";

export type PublishError = {
  ok: false;
  error: {
    code: "unauthenticated" | "forbidden" | "invalid" | "photo";
    fields?: { field: string; code: string }[];
    photos?: { id?: string; code: PhotoCode }[];
  };
};

export type PublishOk = {
  ok: true;
  listing: { id: string; country: CountryCode; slug: string; photoIds: string[] };
};

export type PublishResult = PublishOk | PublishError;

export type SaveListingInput = {
  id?: string;
  intent?: "draft" | "publish";
  country: string;
  title: string;
  story: string;
  category: string;
  size: string;
  city: string;
  brand: string;
  condition: string;
  price: number;
  freeShipping: boolean;
  freeShippingOver: number | null;
  sellerKind?: "private" | "business";
  /** Server-issued ids. A URL is not accepted. */
  photoIds?: string[];
  /** Rejected. The client must not submit a URL. */
  photoUrl?: string;
  uploadedPhoto?: string;
  url?: string;
};

export type StoredListing = {
  id: string;
  sellerId: string;
  slug: string;
  country: CountryCode;
  title: string;
  description: string;
  category: CategoryKey;
  priceAmount: number;
  currency: CurrencyCode;
  size: string;
  condition: string;
  city: string;
  brand: string;
  visibility: Visibility;
  photosCompliant: boolean;
  legacyPhotoUrl: string | null;
  freeShipping: boolean;
  freeShippingOver: number | null;
  era: string;
  createdAt: string;
};

export type StoredPhoto = {
  id: string;
  listingId: string;
  ownerId: string;
  status: PhotoStatus;
  contentType: "image/jpeg" | "image/png" | "image/webp" | null;
  byteSize: number | null;
  pathname: string;
  contentHash: string | null;
  /** Present only after the server has read the object. Not a public claim. */
  url: string | null;
};

export type PublishTx = {
  getListing(id: string): Promise<StoredListing | null>;
  insertListing(row: StoredListing): Promise<void>;
  updateListing(row: StoredListing): Promise<void>;
  listPhotos(listingId: string): Promise<StoredPhoto[]>;
  getPhoto(id: string): Promise<StoredPhoto | null>;
  insertPhoto(row: StoredPhoto): Promise<void>;
  updatePhoto(row: StoredPhoto): Promise<void>;
  slugTaken(country: CountryCode, slug: string): Promise<boolean>;
};

export type PublishStore = {
  transact<T>(listingId: string, run: (tx: PublishTx) => Promise<T>): Promise<T>;
  publicListings(country: CountryCode): Promise<StoredListing[]>;
};

export type BlobObject = { bytes: Uint8Array; url: string };

export type BlobReader = {
  read(pathname: string): Promise<BlobObject | null>;
};
