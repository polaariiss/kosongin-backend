ALTER TYPE "public"."challenge_category" ADD VALUE 'LowSpend';--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "source_url" text;