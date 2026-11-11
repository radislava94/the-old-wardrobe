CREATE TABLE "listing_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"status" text NOT NULL,
	"content_type" text,
	"byte_size" integer,
	"pathname" text NOT NULL,
	"content_hash" text,
	"url" text,
	CONSTRAINT "listing_photos_status" CHECK ("listing_photos"."status" in ('pending', 'ready', 'failed', 'deleted')),
	CONSTRAINT "listing_photos_type" CHECK ("listing_photos"."content_type" is null or "listing_photos"."content_type" in ('image/jpeg', 'image/png', 'image/webp'))
);
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "visibility" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "photos_compliant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "listing_photos_pathname" ON "listing_photos" USING btree ("pathname");--> statement-breakpoint
CREATE INDEX "listing_photos_listing" ON "listing_photos" USING btree ("listing_id");--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_visibility" CHECK ("listings"."visibility" in ('draft', 'public', 'sold'));