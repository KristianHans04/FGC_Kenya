-- Add page view tracking to MediaArticle
CREATE TABLE IF NOT EXISTS "MediaPageView" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "articleId" TEXT NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "referrer" TEXT,
  "sessionId" TEXT,
  "userId" TEXT,
  "country" TEXT,
  "city" TEXT,
  CONSTRAINT "MediaPageView_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "MediaArticle"(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX "MediaPageView_articleId_idx" ON "MediaPageView"("articleId");
CREATE INDEX "MediaPageView_viewedAt_idx" ON "MediaPageView"("viewedAt");
CREATE INDEX "MediaPageView_userId_idx" ON "MediaPageView"("userId");

-- Add draft fields to MediaArticle
ALTER TABLE "MediaArticle" ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN DEFAULT true;
ALTER TABLE "MediaArticle" ADD COLUMN IF NOT EXISTS "draftSavedAt" TIMESTAMP(3);
ALTER TABLE "MediaArticle" ADD COLUMN IF NOT EXISTS "scheduledPublishAt" TIMESTAMP(3);
ALTER TABLE "MediaArticle" ADD COLUMN IF NOT EXISTS "lastEditedBy" TEXT;
ALTER TABLE "MediaArticle" ADD COLUMN IF NOT EXISTS "readTime" INTEGER; -- in minutes