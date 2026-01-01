-- Add slug columns to all tables for secure, non-sequential identifiers
-- These will be indexed for optimal query performance

-- Users table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "User_slug_idx" ON "User"("slug");

-- Applications table
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "Application_slug_idx" ON "Application"("slug");

-- Payments table
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "Payment_slug_idx" ON "Payment"("slug");

-- Media table
ALTER TABLE "Media" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "Media_slug_idx" ON "Media"("slug");

-- Events table (if exists)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "Event_slug_idx" ON "Event"("slug");

-- Sessions table (if exists)
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "Session_slug_idx" ON "Session"("slug");

-- EmailCampaign table (if exists)
ALTER TABLE "EmailCampaign" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "EmailCampaign_slug_idx" ON "EmailCampaign"("slug");

-- EmailGroup table (if exists)
ALTER TABLE "EmailGroup" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "EmailGroup_slug_idx" ON "EmailGroup"("slug");

-- ApplicationForm table (if exists)
ALTER TABLE "ApplicationForm" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(16) UNIQUE;
CREATE INDEX IF NOT EXISTS "ApplicationForm_slug_idx" ON "ApplicationForm"("slug");

-- Update existing records with slugs (run this in a separate migration or script)
-- This is just a template - you'll need to generate unique slugs for existing records