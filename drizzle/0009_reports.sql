CREATE TABLE "listing_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"created_at" date NOT NULL,
	CONSTRAINT "listing_reports_reason" CHECK ("listing_reports"."reason" in ('not_as_described', 'prohibited', 'other'))
);
--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_reporter_id_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "listing_reports_listing_reporter" ON "listing_reports" USING btree ("listing_id","reporter_id");--> statement-breakpoint
CREATE INDEX "listing_reports_listing" ON "listing_reports" USING btree ("listing_id");