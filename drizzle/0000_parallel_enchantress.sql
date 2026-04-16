CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_username" varchar(255) NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_username_unique" UNIQUE("user_username"),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"full_description" text NOT NULL,
	"rules" text,
	"how_to" text,
	"category_tag" varchar(100),
	"image_url" text,
	"duration_days" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consumption_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"item_category" varchar NOT NULL,
	"reason" text,
	"image_url" text,
	"amount" numeric(10, 2),
	"notes" text,
	"consumed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"acctivity_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"progress" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_username" varchar(255) NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reminder_time" varchar(5),
	"reminder_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_user_username_unique" UNIQUE("user_username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"item_category" varchar NOT NULL,
	"price_estimate" numeric(10, 2),
	"is_fulfilled" boolean DEFAULT false NOT NULL,
	"wishlist_status" varchar DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consumption_logs" ADD CONSTRAINT "consumption_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;