DO $$ BEGIN
 CREATE TYPE user_role AS ENUM('customer', 'developer', 'editor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS projects (
	"id" SERIAL PRIMARY KEY,
	"name" character varying NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
	"id" SERIAL PRIMARY KEY,
	"name" character varying NOT NULL,
	"email" character varying NOT NULL,
	"role" user_role
);
