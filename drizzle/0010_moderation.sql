CREATE TABLE "moderation_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"evidence" text NOT NULL,
	"confidence" integer NOT NULL,
	"provenance" text NOT NULL,
	"opened_at" text NOT NULL,
	"retain_until" text NOT NULL,
	"decided_by" text,
	"decided_at" text,
	CONSTRAINT "moderation_flags_confidence" CHECK ("moderation_flags"."confidence" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "moderation_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"flag_id" text NOT NULL,
	"from_state" text NOT NULL,
	"to_state" text NOT NULL,
	"actor_id" text NOT NULL,
	"at" text NOT NULL,
	"retain_until" text NOT NULL,
	CONSTRAINT "moderation_logs_states" CHECK ("moderation_logs"."from_state" in ('clear', 'queued', 'kept', 'hidden') and "moderation_logs"."to_state" in ('clear', 'queued', 'kept', 'hidden'))
);
--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "moderation" text DEFAULT 'clear' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "moderation_decided_by" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "moderation_decided_at" text;--> statement-breakpoint
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderation_flags_listing" ON "moderation_flags" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "moderation_logs_listing" ON "moderation_logs" USING btree ("listing_id");--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_moderation" CHECK ("listings"."moderation" in ('clear', 'queued', 'kept', 'hidden'));