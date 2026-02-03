-- AlterTable: Add email verification fields to users table (SPEC-MVP-002)
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "verification_token" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "verification_token_expires" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "verification_email_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "last_verification_email_sent" TIMESTAMP(3);

-- AlterTable: Add password reset fields to users table (SPEC-MVP-003)
ALTER TABLE "users" ADD COLUMN "reset_token" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "reset_token_expires" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "reset_request_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "last_reset_request" TIMESTAMP(3);

-- CreateIndex: Add unique constraint on verification_token
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex: Add unique constraint on reset_token
CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");

-- CreateIndex: Add index on verification_token for faster lookups
CREATE INDEX "users_verification_token_idx" ON "users"("verification_token");

-- CreateIndex: Add index on reset_token for faster lookups
CREATE INDEX "users_reset_token_idx" ON "users"("reset_token");
