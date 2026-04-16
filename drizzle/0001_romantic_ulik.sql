CREATE TYPE "public"."consumption_category" AS ENUM('makanan & minuman', 'fashion', 'elektronik', 'perawatan diri', 'hiburan', 'lainnya');--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" uuid NOT NULL,
	"token" varchar(255),
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token_blacklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"expired_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "token_blacklists_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "consumption_logs" ALTER COLUMN "item_category" SET DATA TYPE "public"."consumption_category" USING "item_category"::"public"."consumption_category";--> statement-breakpoint
ALTER TABLE "wishlists" ALTER COLUMN "item_category" SET DATA TYPE "public"."consumption_category" USING "item_category"::"public"."consumption_category";--> statement-breakpoint
ALTER TABLE "consumption_logs" ADD COLUMN "item_category_custom" varchar(100);--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "item_category_custom" varchar(100);--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_logs" DROP COLUMN "reason";