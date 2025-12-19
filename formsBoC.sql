CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"email" varchar(150) NOT NULL UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"is_active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "roles" (
	"id" integer NOT NULL,
	"name" varchar(50) NOT NULL UNIQUE,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" bigint NOT NULL,
	PRIMARY KEY ("user_id", "role_id")
);

CREATE TABLE IF NOT EXISTS "forms" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"title" varchar(200) NOT NULL,
	"description" varchar(255) NOT NULL,
	"form_type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"owner_id" uuid NOT NULL,
	"cloned_from" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	"banner_image_url" varchar(500),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"form_id" uuid NOT NULL,
	"question_text" varchar(255) NOT NULL,
	"question_type" varchar(30) NOT NULL,
	"score" numeric(5,2) NOT NULL,
	"required" boolean NOT NULL DEFAULT true,
	"image_url" varchar(500),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "question_options" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"question_id" uuid NOT NULL,
	"option_text" varchar(255) NOT NULL,
	"is_correct" boolean NOT NULL DEFAULT false,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "invitations" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"form_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"max_attempts" bigint NOT NULL DEFAULT '1',
	"created_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "responses" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"form_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invitation_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	"finished_at" timestamp with time zone NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "response_details" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"response_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_text" varchar(255) NOT NULL,
	"selected_option_id" uuid NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "evaluations" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"response_id" uuid NOT NULL,
	"total_score" numeric(6,2) NOT NULL,
	"max_score" numeric(6,2) NOT NULL,
	"passed" boolean NOT NULL,
	"evaluated_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "scores" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"user_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"score" numeric(6,2) NOT NULL,
	"attempt" bigint NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid NOT NULL DEFAULT 'uuid_generate_v4',
	"user_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity" varchar(100) NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT 'current_timestamp',
	PRIMARY KEY ("id")
);



ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_fk1" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "forms" ADD CONSTRAINT "forms_fk5" FOREIGN KEY ("owner_id") REFERENCES "users"("id");
ALTER TABLE "questions" ADD CONSTRAINT "questions_fk1" FOREIGN KEY ("form_id") REFERENCES "forms"("id");
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_fk1" FOREIGN KEY ("question_id") REFERENCES "questions"("id");
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_fk1" FOREIGN KEY ("form_id") REFERENCES "forms"("id");
ALTER TABLE "responses" ADD CONSTRAINT "responses_fk1" FOREIGN KEY ("form_id") REFERENCES "forms"("id");
ALTER TABLE "response_details" ADD CONSTRAINT "response_details_fk1" FOREIGN KEY ("response_id") REFERENCES "responses"("id");
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_fk1" FOREIGN KEY ("response_id") REFERENCES "responses"("id");
ALTER TABLE "scores" ADD CONSTRAINT "scores_fk1" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_fk1" FOREIGN KEY ("user_id") REFERENCES "users"("id");