-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('player', 'recruiter', 'admin');

-- CreateEnum
CREATE TYPE "Foot" AS ENUM ('left', 'right', 'both');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('pending', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('club', 'academy', 'agency', 'other');

-- CreateEnum
CREATE TYPE "RecruiterStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "user_type" "UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "birth_date" DATE NOT NULL,
    "nationality" VARCHAR(100),
    "city" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL,
    "primary_position" VARCHAR(50) NOT NULL,
    "secondary_positions" JSONB NOT NULL DEFAULT '[]',
    "strong_foot" "Foot",
    "height_cm" INTEGER,
    "weight_kg" INTEGER,
    "current_club" VARCHAR(255),
    "career_history" TEXT,
    "phone" VARCHAR(50),
    "profile_photo_url" VARCHAR(500),
    "video_urls" JSONB NOT NULL DEFAULT '[]',
    "status" "PlayerStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "organization_name" VARCHAR(255) NOT NULL,
    "organization_type" "OrganizationType" NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "status" "RecruiterStatus" NOT NULL DEFAULT 'pending',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_user_id_key" ON "players"("user_id");

-- CreateIndex
CREATE INDEX "players_country_idx" ON "players"("country");

-- CreateIndex
CREATE INDEX "players_primary_position_idx" ON "players"("primary_position");

-- CreateIndex
CREATE INDEX "players_status_idx" ON "players"("status");

-- CreateIndex
CREATE UNIQUE INDEX "recruiters_user_id_key" ON "recruiters"("user_id");

-- CreateIndex
CREATE INDEX "recruiters_status_idx" ON "recruiters"("status");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
