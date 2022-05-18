CREATE TABLE IF NOT EXISTS auth_otp (
	"id" SERIAL PRIMARY KEY,
	"email" character varying NOT NULL,
	"created_at" INT NOT NULL,
	"otp" character varying NOT NULL
);

ALTER TABLE users ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE users ALTER COLUMN "password" SET NOT NULL;