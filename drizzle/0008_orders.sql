CREATE TABLE "order_items" (
	"order_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"title" text NOT NULL,
	"price_amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"merchandise_total" numeric(12, 2) NOT NULL,
	"shipping_amount" numeric(12, 2),
	"shipping_paid_by" text NOT NULL,
	"buyer_cash_due" numeric(12, 2) NOT NULL,
	"commission_amount" numeric(12, 2) NOT NULL,
	"seller_payout_amount" numeric(12, 2) NOT NULL,
	"currency" text NOT NULL,
	"commission_rate" numeric(6, 4) NOT NULL,
	"threshold_amount" numeric(12, 2) NOT NULL,
	"cap_amount" numeric(12, 2) NOT NULL,
	"rate_reason" text NOT NULL,
	"remit_to" text NOT NULL,
	"cod_status" text NOT NULL,
	"courier_name" text,
	"created_at" date NOT NULL,
	CONSTRAINT "orders_shipping_paid_by" CHECK ("orders"."shipping_paid_by" in ('buyer', 'seller')),
	CONSTRAINT "orders_rate_reason" CHECK ("orders"."rate_reason" in ('launch_promo', 'welcome_sale', 'under_threshold', 'standard')),
	CONSTRAINT "orders_remit_to" CHECK ("orders"."remit_to" in ('seller', 'platform')),
	CONSTRAINT "orders_cod_status" CHECK ("orders"."cod_status" in ('pending', 'paid', 'refused', 'cancelled')),
	CONSTRAINT "orders_currency" CHECK ("orders"."currency" in ('MKD', 'EUR', 'RSD', 'ALL'))
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_buyer" ON "orders" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "orders_seller" ON "orders" USING btree ("seller_id");