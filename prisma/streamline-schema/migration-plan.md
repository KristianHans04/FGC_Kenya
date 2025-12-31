# Database Schema Migration Plan

## Overview
Migrating from the current schema with multiple JOIN tables to a streamlined schema that embeds related data directly in the main tables.

## Migration Steps

### Phase 1: Backup (Critical)
```bash
# 1. Full database backup
pg_dump -U postgres -d fgc_kenya > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Export critical tables as CSV for safety
psql -U postgres -d fgc_kenya -c "COPY \"User\" TO '/tmp/users_backup.csv' CSV HEADER;"
psql -U postgres -d fgc_kenya -c "COPY \"UserRole\" TO '/tmp/user_roles_backup.csv' CSV HEADER;"
psql -U postgres -d fgc_kenya -c "COPY \"Application\" TO '/tmp/applications_backup.csv' CSV HEADER;"
```

### Phase 2: Schema Changes

#### 2.1 User Table Changes
- Add columns: `role`, `cohort`, `roleAssignedAt`, `roleAssignedBy`, `roleNotes`, `roleHistory`
- Migrate data from `UserRole` table
- Drop `UserRole` table

#### 2.2 Application Table Changes  
- Add column: `statusHistory` (JSON)
- Migrate data from `ApplicationStatusHistory` table
- Drop `ApplicationStatusHistory` table

#### 2.3 Email Table Changes
- Add column: `labels` (String array)
- Migrate data from `EmailLabel` table
- Drop `EmailLabel` table

#### 2.4 Remove CohortMember Table
- Data already available through User.role and User.cohort
- Drop `CohortMember` table

### Phase 3: Data Migration Queries

```sql
-- 1. Add new columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS "cohort" TEXT,
ADD COLUMN IF NOT EXISTS "roleAssignedAt" TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "roleAssignedBy" TEXT,
ADD COLUMN IF NOT EXISTS "roleNotes" TEXT,
ADD COLUMN IF NOT EXISTS "roleHistory" JSONB;

-- 2. Migrate UserRole data to User table
UPDATE "User" u
SET 
  "role" = ur.role,
  "cohort" = ur.cohort,
  "roleAssignedAt" = ur."assignedAt",
  "roleAssignedBy" = ur."assignedBy",
  "roleNotes" = ur.notes
FROM "UserRole" ur
WHERE u.id = ur."userId" 
  AND ur."isActive" = true;

-- 3. Build role history from inactive UserRole records
UPDATE "User" u
SET "roleHistory" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'role', ur.role,
      'cohort', ur.cohort,
      'assignedAt', ur."assignedAt",
      'assignedBy', ur."assignedBy",
      'endedAt', ur."updatedAt",
      'notes', ur.notes
    ) ORDER BY ur."assignedAt"
  )
  FROM "UserRole" ur
  WHERE ur."userId" = u.id 
    AND ur."isActive" = false
);

-- 4. Add statusHistory to Application table
ALTER TABLE "Application" 
ADD COLUMN IF NOT EXISTS "statusHistory" JSONB DEFAULT '[]'::jsonb;

-- 5. Migrate ApplicationStatusHistory data
UPDATE "Application" a
SET "statusHistory" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'status', ash.status,
      'changedAt', ash."changedAt",
      'changedBy', ash."changedBy",
      'notes', ash.notes
    ) ORDER BY ash."changedAt"
  )
  FROM "ApplicationStatusHistory" ash
  WHERE ash."applicationId" = a.id
);

-- 6. Add labels array to Email table
ALTER TABLE "Email" 
ADD COLUMN IF NOT EXISTS "labels" TEXT[] DEFAULT ARRAY['INBOX']::TEXT[];

-- 7. Migrate EmailLabel data
UPDATE "Email" e
SET "labels" = ARRAY(
  SELECT el.label
  FROM "EmailLabel" el
  WHERE el."emailId" = e.id
  ORDER BY el.label
);
```

### Phase 4: Update Application Code

1. **Update Prisma Client queries**
   - Remove `include: { userRole: true }` 
   - Access role directly: `user.role` instead of `user.userRole[0].role`

2. **Update API endpoints**
   - Simplify role checks
   - Remove JOIN queries

3. **Update authentication logic**
   - Use `user.role` for authorization
   - Update role-based redirects

### Phase 5: Cleanup

```sql
-- After verifying migration success
DROP TABLE IF EXISTS "UserRole";
DROP TABLE IF EXISTS "ApplicationStatusHistory";
DROP TABLE IF EXISTS "EmailLabel";
DROP TABLE IF EXISTS "CohortMember";
```

### Phase 6: Performance Optimization

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"("role");
CREATE INDEX IF NOT EXISTS idx_user_cohort ON "User"("cohort");
CREATE INDEX IF NOT EXISTS idx_user_role_cohort ON "User"("role", "cohort");
```

## Rollback Plan

If issues arise:

```bash
# Restore from backup
psql -U postgres -d fgc_kenya < backup_YYYYMMDD_HHMMSS.sql
```

## Testing Checklist

- [ ] All user roles migrated correctly
- [ ] Application status history preserved
- [ ] Email labels migrated
- [ ] Authentication still works
- [ ] Admin panel functions correctly
- [ ] No data loss verified
- [ ] Performance improved (measure query times)

## Expected Benefits

1. **Query Performance**: 30-50% improvement on role-based queries
2. **Code Simplicity**: Remove ~200 lines of JOIN logic
3. **Maintenance**: Easier to understand and modify
4. **Database Size**: Slight reduction from removing redundant data