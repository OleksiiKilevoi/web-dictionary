ALTER TABLE users DROP COLUMN IF EXISTS "permissions";
ALTER TABLE users ADD COLUMN "deleteCsv" boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN "uploadCsv" boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN "downloadCsv" boolean DEFAULT false NOT NULL;