DO $$ BEGIN
 CREATE TYPE user_role AS ENUM('customer', 'developer', 'editor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS projects (
	"id" SERIAL PRIMARY KEY,
	"name" character varying NOT NULL,
	"path_to_dictionary" character varying
);

CREATE TABLE IF NOT EXISTS users_to_project (
	"id" SERIAL PRIMARY KEY,
	"project_id" INT NOT NULL,
	"user_id" INT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
	"id" SERIAL PRIMARY KEY,
	"name" character varying,
	"email" character varying NOT NULL,
	"role" user_role
);

DO $$ BEGIN
 ALTER TABLE users_to_project ADD CONSTRAINT users_to_project_project_id_fkey FOREIGN KEY ("project_id") REFERENCES projects(id);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE users_to_project ADD CONSTRAINT users_to_project_user_id_fkey FOREIGN KEY ("user_id") REFERENCES users(id);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_to_project_project_id_user_id_index ON users_to_project (project_id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_index ON users ("email");