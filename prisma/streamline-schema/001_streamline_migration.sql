-- =====================================================================
-- FGC Kenya Database Schema Streamlining Migration
-- Version: 1.0.0
-- Date: 2024-12-31
-- Description: Migrates from multiple JOIN tables to embedded fields
-- =====================================================================

-- Start transaction for atomicity
BEGIN;

-- =====================================================================
-- STEP 1: Add new columns to User table
-- =====================================================================

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS "cohort" TEXT,
ADD COLUMN IF NOT EXISTS "roleAssignedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "roleAssignedBy" TEXT,
ADD COLUMN IF NOT EXISTS "roleNotes" TEXT,
ADD COLUMN IF NOT EXISTS "roleHistory" JSONB DEFAULT '[]'::jsonb;

-- Add check constraint for valid roles
ALTER TABLE "User" 
ADD CONSTRAINT check_valid_role 
CHECK ("role" IN ('SUPER_ADMIN', 'ADMIN', 'MENTOR', 'STUDENT', 'ALUMNI', 'USER'));

-- =====================================================================
-- STEP 2: Migrate active roles from UserRole to User table
-- =====================================================================

-- Update users with their active roles
UPDATE "User" u
SET 
  "role" = COALESCE(ur.role, 'USER'),
  "cohort" = ur.cohort,
  "roleAssignedAt" = COALESCE(ur."assignedAt", NOW()),
  "roleAssignedBy" = ur."assignedBy",
  "roleNotes" = ur.notes
FROM "UserRole" ur
WHERE u.id = ur."userId" 
  AND ur."isActive" = true;

-- Build role history from all UserRole records
WITH role_history AS (
  SELECT 
    "userId",
    jsonb_agg(
      jsonb_build_object(
        'role', role,
        'cohort', cohort,
        'assignedAt', "assignedAt",
        'assignedBy', "assignedBy",
        'endedAt', CASE WHEN "isActive" = false THEN "updatedAt" ELSE NULL END,
        'notes', notes
      ) ORDER BY "assignedAt"
    ) as history
  FROM "UserRole"
  GROUP BY "userId"
)
UPDATE "User" u
SET "roleHistory" = rh.history
FROM role_history rh
WHERE u.id = rh."userId";

-- =====================================================================
-- STEP 3: Add statusHistory to Application table
-- =====================================================================

ALTER TABLE "Application" 
ADD COLUMN IF NOT EXISTS "statusHistory" JSONB DEFAULT '[]'::jsonb;

-- Migrate existing status history
WITH status_history AS (
  SELECT 
    "applicationId",
    jsonb_agg(
      jsonb_build_object(
        'status', status,
        'changedAt', "changedAt",
        'changedBy', "changedBy",
        'notes', notes,
        'metadata', metadata
      ) ORDER BY "changedAt"
    ) as history
  FROM "ApplicationStatusHistory"
  GROUP BY "applicationId"
)
UPDATE "Application" a
SET "statusHistory" = sh.history
FROM status_history sh
WHERE a.id = sh."applicationId";

-- Add current status to history if not already present
UPDATE "Application" a
SET "statusHistory" = 
  CASE 
    WHEN "statusHistory" = '[]'::jsonb OR "statusHistory" IS NULL
    THEN jsonb_build_array(
      jsonb_build_object(
        'status', a.status,
        'changedAt', a."updatedAt",
        'changedBy', 'system',
        'notes', 'Initial status'
      )
    )
    ELSE "statusHistory"
  END;

-- =====================================================================
-- STEP 4: Add labels array to Email table
-- =====================================================================

ALTER TABLE "Email" 
ADD COLUMN IF NOT EXISTS "labels" TEXT[] DEFAULT ARRAY['INBOX']::TEXT[];

-- Migrate email labels
WITH email_labels AS (
  SELECT 
    "emailId",
    array_agg(label ORDER BY label) as labels
  FROM "EmailLabel"
  GROUP BY "emailId"
)
UPDATE "Email" e
SET "labels" = el.labels
FROM email_labels el
WHERE e.id = el."emailId";

-- =====================================================================
-- STEP 5: Create indexes for performance
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_user_role ON "User"("role");
CREATE INDEX IF NOT EXISTS idx_user_cohort ON "User"("cohort");
CREATE INDEX IF NOT EXISTS idx_user_role_cohort ON "User"("role", "cohort");
CREATE INDEX IF NOT EXISTS idx_application_status_history ON "Application" USING GIN("statusHistory");
CREATE INDEX IF NOT EXISTS idx_email_labels ON "Email" USING GIN("labels");

-- =====================================================================
-- STEP 6: Create backup tables before dropping
-- =====================================================================

-- Create backup tables with timestamp
CREATE TABLE IF NOT EXISTS "_backup_UserRole_20241231" AS SELECT * FROM "UserRole";
CREATE TABLE IF NOT EXISTS "_backup_ApplicationStatusHistory_20241231" AS SELECT * FROM "ApplicationStatusHistory";
CREATE TABLE IF NOT EXISTS "_backup_EmailLabel_20241231" AS SELECT * FROM "EmailLabel";
CREATE TABLE IF NOT EXISTS "_backup_CohortMember_20241231" AS SELECT * FROM "CohortMember";

-- =====================================================================
-- STEP 7: Drop foreign key constraints
-- =====================================================================

-- Drop foreign keys referencing tables to be removed
ALTER TABLE "UserRole" DROP CONSTRAINT IF EXISTS "UserRole_userId_fkey";
ALTER TABLE "UserRole" DROP CONSTRAINT IF EXISTS "UserRole_assignedBy_fkey";
ALTER TABLE "ApplicationStatusHistory" DROP CONSTRAINT IF EXISTS "ApplicationStatusHistory_applicationId_fkey";
ALTER TABLE "EmailLabel" DROP CONSTRAINT IF EXISTS "EmailLabel_emailId_fkey";
ALTER TABLE "CohortMember" DROP CONSTRAINT IF EXISTS "CohortMember_cohortId_fkey";
ALTER TABLE "CohortMember" DROP CONSTRAINT IF EXISTS "CohortMember_userId_fkey";

-- =====================================================================
-- STEP 8: Drop old tables (commented out for safety)
-- =====================================================================

-- Uncomment these lines after verifying migration success
-- DROP TABLE IF EXISTS "UserRole";
-- DROP TABLE IF EXISTS "ApplicationStatusHistory";
-- DROP TABLE IF EXISTS "EmailLabel";
-- DROP TABLE IF EXISTS "CohortMember";

-- =====================================================================
-- STEP 9: Add helper functions for role management
-- =====================================================================

-- Function to update user role and maintain history
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id TEXT,
  p_new_role TEXT,
  p_cohort TEXT DEFAULT NULL,
  p_assigned_by TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_current_role RECORD;
BEGIN
  -- Get current role
  SELECT role, cohort, "roleAssignedAt", "roleAssignedBy", "roleNotes"
  INTO v_current_role
  FROM "User"
  WHERE id = p_user_id;
  
  -- Add current role to history
  UPDATE "User"
  SET "roleHistory" = COALESCE("roleHistory", '[]'::jsonb) || jsonb_build_object(
    'role', v_current_role.role,
    'cohort', v_current_role.cohort,
    'assignedAt', v_current_role."roleAssignedAt",
    'assignedBy', v_current_role."roleAssignedBy",
    'endedAt', NOW(),
    'notes', v_current_role."roleNotes"
  )
  WHERE id = p_user_id;
  
  -- Update to new role
  UPDATE "User"
  SET 
    role = p_new_role,
    cohort = p_cohort,
    "roleAssignedAt" = NOW(),
    "roleAssignedBy" = p_assigned_by,
    "roleNotes" = p_notes
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add application status change
CREATE OR REPLACE FUNCTION add_application_status(
  p_application_id TEXT,
  p_new_status TEXT,
  p_changed_by TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE "Application"
  SET 
    status = p_new_status,
    "statusHistory" = COALESCE("statusHistory", '[]'::jsonb) || jsonb_build_object(
      'status', p_new_status,
      'changedAt', NOW(),
      'changedBy', p_changed_by,
      'notes', p_notes
    ),
    "updatedAt" = NOW()
  WHERE id = p_application_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check migration success
DO $$
DECLARE
  v_user_count INTEGER;
  v_role_count INTEGER;
  v_app_count INTEGER;
  v_status_count INTEGER;
BEGIN
  -- Verify user roles migrated
  SELECT COUNT(*) INTO v_user_count FROM "User" WHERE role IS NOT NULL;
  SELECT COUNT(*) INTO v_role_count FROM "_backup_UserRole_20241231" WHERE "isActive" = true;
  
  IF v_user_count < v_role_count THEN
    RAISE EXCEPTION 'User role migration incomplete: % users vs % roles', v_user_count, v_role_count;
  END IF;
  
  -- Verify application status history migrated
  SELECT COUNT(*) INTO v_app_count FROM "Application" WHERE "statusHistory" != '[]'::jsonb;
  SELECT COUNT(DISTINCT "applicationId") INTO v_status_count FROM "_backup_ApplicationStatusHistory_20241231";
  
  IF v_app_count < v_status_count THEN
    RAISE WARNING 'Application status history may be incomplete: % apps vs % with history', v_app_count, v_status_count;
  END IF;
  
  RAISE NOTICE 'Migration verification passed. Users with roles: %, Applications with history: %', v_user_count, v_app_count;
END $$;

-- Commit transaction
COMMIT;

-- =====================================================================
-- POST-MIGRATION NOTES
-- =====================================================================
-- 1. Run application tests to verify functionality
-- 2. Monitor for any errors in logs
-- 3. After 24-48 hours of stable operation, run cleanup:
--    DROP TABLE IF EXISTS "UserRole", "ApplicationStatusHistory", "EmailLabel", "CohortMember";
--    DROP TABLE IF EXISTS "_backup_UserRole_20241231", "_backup_ApplicationStatusHistory_20241231", 
--                         "_backup_EmailLabel_20241231", "_backup_CohortMember_20241231";
-- =====================================================================