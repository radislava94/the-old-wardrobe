CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"kind" text NOT NULL,
	"note" text,
	"created_at" date NOT NULL,
	CONSTRAINT "offers_kind" CHECK ("offers"."kind" in ('buyer', 'seller')),
	CONSTRAINT "offers_amount_positive" CHECK ("offers"."amount" > 0),
	CONSTRAINT "offers_currency" CHECK ("offers"."currency" in ('MKD', 'EUR', 'RSD', 'ALL'))
);
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_from_user_id_profiles_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_to_user_id_profiles_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offers_listing" ON "offers" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "offers_to" ON "offers" USING btree ("to_user_id");