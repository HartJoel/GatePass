-- Replace the hash-only token with a plaintext 6-digit entry code (resident choice: code is
-- shareable and viewable again later, not shown once). Existing rows get a freshly generated
-- random code since their old tokenHash can't be converted back to a 6-digit code.
ALTER TABLE "visitor_pass" ADD COLUMN "code" TEXT;

UPDATE "visitor_pass" SET "code" = lpad((floor(random() * 1000000))::text, 6, '0') WHERE "code" IS NULL;

ALTER TABLE "visitor_pass" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "visitor_pass" ADD CONSTRAINT "visitor_pass_code_key" UNIQUE ("code");

ALTER TABLE "visitor_pass" DROP COLUMN "tokenHash";
