ALTER TABLE users_to_project ADD COLUMN "deleteCsv" boolean DEFAULT false NOT NULL;
ALTER TABLE users_to_project ADD COLUMN "uploadCsv" boolean DEFAULT false NOT NULL;
ALTER TABLE users_to_project ADD COLUMN "downloadCsv" boolean DEFAULT false NOT NULL;
ALTER TABLE users DROP COLUMN IF EXISTS "deleteCsv";
ALTER TABLE users DROP COLUMN IF EXISTS "uploadCsv";
ALTER TABLE users DROP COLUMN IF EXISTS "downloadCsv";