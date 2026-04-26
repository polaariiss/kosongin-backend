CREATE TYPE "public"."activity_type" AS ENUM('login', 'register', 'add_consumption', 'add_wishlist', 'cancel_wishlist', 'join_challenge');--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD COLUMN "activity_type" "activity_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "waiting_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "notification_sent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_activity_logs" DROP COLUMN "acctivity_type";