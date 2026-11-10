ALTER TABLE "listings" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "free_shipping" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "free_shipping_over" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "seller_kind" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_free_shipping_over" CHECK ("listings"."free_shipping_over" is null or "listings"."free_shipping_over" > 0);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_seller_kind" CHECK ("profiles"."seller_kind" in ('private', 'business'));