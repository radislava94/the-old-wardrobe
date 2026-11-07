import type { CountryCode } from "../countries";
import type { PublishStore, PublishTx, StoredListing, StoredPhoto } from "./publish-types";

type Tables = {
  listings: Map<string, StoredListing>;
  photos: Map<string, StoredPhoto>;
};

function clone(tables: Tables): Tables {
  return {
    listings: new Map([...tables.listings].map(([id, row]) => [id, { ...row }])),
    photos: new Map([...tables.photos].map(([id, row]) => [id, { ...row }])),
  };
}

/**
 * One lock per listing. A second save waits, then sees the first save's rows,
 * so the photo cap and the public minimum cannot race.
 */
export function createMemoryPublishStore(): PublishStore & {
  listings: Map<string, StoredListing>;
  photos: Map<string, StoredPhoto>;
  read(): Tables;
} {
  const state: Tables = { listings: new Map(), photos: new Map() };
  const tails = new Map<string, Promise<void>>();

  function txFor(tables: Tables): PublishTx {
    return {
      async getListing(id) {
        const row = tables.listings.get(id);
        return row ? { ...row } : null;
      },
      async insertListing(row) {
        tables.listings.set(row.id, { ...row });
      },
      async updateListing(row) {
        tables.listings.set(row.id, { ...row });
      },
      async listPhotos(listingId) {
        return [...tables.photos.values()]
          .filter((photo) => photo.listingId === listingId)
          .map((photo) => ({ ...photo }));
      },
      async getPhoto(id) {
        const row = tables.photos.get(id);
        return row ? { ...row } : null;
      },
      async insertPhoto(row) {
        tables.photos.set(row.id, { ...row });
      },
      async updatePhoto(row) {
        tables.photos.set(row.id, { ...row });
      },
      async slugTaken(country: CountryCode, slug: string) {
        return [...tables.listings.values()].some(
          (listing) => listing.country === country && listing.slug === slug,
        );
      },
    };
  }

  return {
    listings: state.listings,
    photos: state.photos,
    read: () => state,
    async publicListings(country) {
      return [...state.listings.values()].filter(
        (listing) =>
          listing.country === country &&
          (listing.visibility === "public" || listing.visibility === "sold"),
      );
    },
    transact(listingId, run) {
      const previous = tails.get(listingId) ?? Promise.resolve();
      let release = () => {};
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const tail = previous.then(() => gate);
      tails.set(listingId, tail);
      return previous.then(async () => {
        const snap = clone(state);
        try {
          const value = await run(txFor(snap));
          state.listings.clear();
          for (const [id, row] of snap.listings) state.listings.set(id, row);
          state.photos.clear();
          for (const [id, row] of snap.photos) state.photos.set(id, row);
          return value;
        } finally {
          release();
        }
      });
    },
  };
}

export function memoryBlob(objects: Map<string, { bytes: Uint8Array; url: string }>) {
  return {
    async read(pathname: string) {
      const found = objects.get(pathname);
      return found ? { bytes: found.bytes, url: found.url } : null;
    },
  };
}
