DO $$ BEGIN
 CREATE TYPE user_permissions AS ENUM('edit', 'download', '');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE users DROP COLUMN IF EXISTS "role";
ALTER TABLE users ADD COLUMN "permissions" JSONB;