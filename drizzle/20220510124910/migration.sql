ALTER TABLE projects ADD COLUMN "path_to_dictionary" character varying;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_index ON users ("email");