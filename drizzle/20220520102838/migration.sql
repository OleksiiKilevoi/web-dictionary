DO $$ BEGIN
 CREATE TYPE role AS ENUM('customer', 'user');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE users ADD COLUMN "role" role DEFAULT 'user' NOT NULL;