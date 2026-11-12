import { describe, expect, it } from "vitest";
import { parsePublishSchema } from "./publish-schema";

describe("parsePublishSchema", () => {
  it("reads booleans from the information_schema probe", () => {
    expect(
      parsePublishSchema({
        visibility: false,
        photos_compliant: false,
        listing_photos: true,
      }),
    ).toEqual({
      visibility: false,
      photosCompliant: false,
      listingPhotos: true,
    });
  });

  it("accepts the text forms some drivers return for exists", () => {
    expect(
      parsePublishSchema({
        visibility: "t",
        photos_compliant: "f",
        listing_photos: "true",
      }),
    ).toEqual({
      visibility: true,
      photosCompliant: false,
      listingPhotos: true,
    });
  });

  it("returns null when the row is a different probe", () => {
    expect(parsePublishSchema({ listings: null, profiles: null, reviews: null })).toBeNull();
    expect(parsePublishSchema(undefined)).toBeNull();
  });
});
