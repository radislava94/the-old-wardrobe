CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"country" text NOT NULL,
	"seller_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"price_amount" integer NOT NULL,
	"currency" text NOT NULL,
	"size" text NOT NULL,
	"era" text NOT NULL,
	"condition" text NOT NULL,
	"city" text NOT NULL,
	"status" text NOT NULL,
	"photo" text NOT NULL,
	"created_at" date NOT NULL,
	"brand" text,
	CONSTRAINT "listings_country" CHECK ("listings"."country" in ('mk', 'bg', 'sr-rs', 'sq-al')),
	CONSTRAINT "listings_currency" CHECK ("listings"."currency" in ('MKD', 'EUR', 'RSD', 'ALL')),
	CONSTRAINT "listings_category" CHECK ("listings"."category" in ('dresses', 'coats', 'knitwear', 'denim', 'accessories')),
	CONSTRAINT "listings_status" CHECK ("listings"."status" in ('available', 'sold')),
	CONSTRAINT "listings_price_positive" CHECK ("listings"."price_amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"member_since" date NOT NULL,
	"bio" text NOT NULL,
	CONSTRAINT "profiles_country" CHECK ("profiles"."country" in ('mk', 'bg', 'sr-rs', 'sq-al'))
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"order_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"stars" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" date NOT NULL,
	"country" text NOT NULL,
	"first_party" boolean DEFAULT false NOT NULL,
	CONSTRAINT "reviews_stars_range" CHECK ("reviews"."stars" between 1 and 5),
	CONSTRAINT "reviews_country" CHECK ("reviews"."country" in ('mk', 'bg', 'sr-rs', 'sq-al'))
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_seller_id_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "listings_country_slug" ON "listings" USING btree ("country","slug");--> statement-breakpoint
CREATE INDEX "listings_country_created" ON "listings" USING btree ("country","created_at");--> statement-breakpoint
CREATE INDEX "listings_seller" ON "listings" USING btree ("seller_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_country_handle" ON "profiles" USING btree ("country","handle");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_order_id" ON "reviews" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "reviews_seller" ON "reviews" USING btree ("seller_id");