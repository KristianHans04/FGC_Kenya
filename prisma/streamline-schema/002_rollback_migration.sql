-- =====================================================================
-- FGC Kenya Database Schema Rollback Script
-- Version: 1.0.0
-- Date: 2024-12-31
-- Description: Rollback streamlined schema to original structure
-- =====================================================================

-- Start transaction for atomicity
BEGIN;

-- =====================================================================
-- STEP 1: Restore original tables from backups
-- =====================================================================

-- Restore UserRole table
DROP TABLE IF EXISTS "UserRole";
CREATE TABLE "UserRole" AS SELECT * FROM "_backup_UserRole_20241231";

-- Restore ApplicationStatusHistory table
DROP TABLE IF EXISTS "ApplicationStatusHistory";
CREATE TABLE "ApplicationStatusHistory" AS SELECT * FROM "_backup_ApplicationStatusHistory_20241231";

-- Restore EmailLabel table
DROP TABLE IF EXISTS "EmailLabel";
CREATE TABLE "EmailLabel" AS SELECT * FROM "_backup_EmailLabel_20241231";

-- Restore CohortMember table
DROP TABLE IF EXISTS "CohortMember";
CREATE TABLE "CohortMember" AS SELECT * FROM "_backup_CohortMember_20241231";

-- =====================================================================
-- STEP 2: Restore constraints and indexes
-- =====================================================================

-- UserRole constraints
ALTER TABLE "UserRole" ADD PRIMARY KEY (id);
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_assignedBy_fkey" 
  FOREIGN KEY ("assignedBy") REFERENCES "User"(id) ON DELETE SET NULL;
CREATE INDEX idx_userrole_userid ON "UserRole"("userId");
CREATE INDEX idx_userrole_role ON "UserRole"(role);
CREATE INDEX idx_userrole_active ON "UserRole"("isActive");

-- ApplicationStatusHistory constraints
ALTER TABLE "ApplicationStatusHistory" ADD PRIMARY KEY (id);
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" 
  FOREIGN KEY ("applicationId") REFERENCES "Application"(id) ON DELETE CASCADE;
CREATE INDEX idx_appstatushistory_appid ON "ApplicationStatusHistory"("applicationId");
CREATE INDEX idx_appstatushistory_status ON "ApplicationStatusHistory"(status);

-- EmailLabel constraints
ALTER TABLE "EmailLabel" ADD PRIMARY KEY (id);
ALTER TABLE "EmailLabel" ADD CONSTRAINT "EmailLabel_emailId_fkey" 
  FOREIGN KEY ("emailId") REFERENCES "Email"(id) ON DELETE CASCADE;
CREATE INDEX idx_emaillabel_emailid ON "EmailLabel"("emailId");
CREATE INDEX idx_emaillabel_label ON "EmailLabel"(label);

-- CohortMember constraints
ALTER TABLE "CohortMember" ADD PRIMARY KEY (id);
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "CohortMember" ADD CONSTRAINT "CohortMember_cohortId_fkey" 
  FOREIGN KEY ("cohortId") REFERENCES "Cohort"(id) ON DELETE CASCADE;
CREATE INDEX idx_cohortmember_userid ON "CohortMember"("userId");
CREATE INDEX idx_cohortmember_cohortid ON "CohortMember"("cohortId");

-- =====================================================================
-- STEP 3: Remove added columns from main tables
-- =====================================================================

-- Remove columns from User table
ALTER TABLE "User" 
DROP COLUMN IF EXISTS "role",
DROP COLUMN IF EXISTS "cohort",
DROP COLUMN IF EXISTS "roleAssignedAt",
DROP COLUMN IF EXISTS "roleAssignedBy",
DROP COLUMN IF EXISTS "roleNotes",
DROP COLUMN IF EXISTS "roleHistory";

-- Remove statusHistory from Application table
ALTER TABLE "Application" 
DROP COLUMN IF EXISTS "statusHistory";

-- Remove labels from Email table
ALTER TABLE "Email" 
DROP COLUMN IF EXISTS "labels";

-- =====================================================================
-- STEP 4: Drop helper functions
-- =====================================================================

DROP FUNCTION IF EXISTS update_user_role(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS add_application_status(TEXT, TEXT, TEXT, TEXT);

-- =====================================================================
-- STEP 5: Remove new indexes
-- =====================================================================

DROP INDEX IF EXISTS idx_user_role;
DROP INDEX IF EXISTS idx_user_cohort;
DROP INDEX IF EXISTS idx_user_role_cohort;
DROP INDEX IF EXISTS idx_application_status_history;
DROP INDEX IF EXISTS idx_email_labels;

-- =====================================================================
-- VERIFICATION
-- =====================================================================

DO $$
DECLARE
  v_userrole_count INTEGER;
  v_apphistory_count INTEGER;
  v_emaillabel_count INTEGER;
BEGIN
  -- Verify tables restored
  SELECT COUNT(*) INTO v_userrole_count FROM "UserRole";
  SELECT COUNT(*) INTO v_apphistory_count FROM "ApplicationStatusHistory";
  SELECT COUNT(*) INTO v_emaillabel_count FROM "EmailLabel";
  
  IF v_userrole_count = 0 THEN
    RAISE EXCEPTION 'UserRole table is empty after rollback';
  END IF;
  
  RAISE NOTICE 'Rollback completed. UserRoles: %, AppHistory: %, EmailLabels: %', 
    v_userrole_count, v_apphistory_count, v_emaillabel_count;
END $$;

-- Commit transaction
COMMIT;

-- =====================================================================
-- POST-ROLLBACK NOTES
-- =====================================================================
-- 1. Restart application to reconnect with original schema
-- 2. Verify all functionality works as before
-- 3. Clean up backup tables after confirming stability:
--    DROP TABLE IF EXISTS "_backup_UserRole_20241231";
--    DROP TABLE IF EXISTS "_backup_ApplicationStatusHistory_20241231";
--    DROP TABLE IF EXISTS "_backup_EmailLabel_20241231";
--    DROP TABLE IF EXISTS "_backup_CohortMember_20241231";
-- =====================================================================