ALTER TABLE "password_reset_token" DROP CONSTRAINT "password_reset_token_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "password_reset_token" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;