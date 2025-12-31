bru# Code Updates for Streamlined Schema

## Overview
This document outlines all code changes needed to support the streamlined database schema.

## 1. Prisma Schema Updates

### Current Schema References to Update:
- `user.userRoles` → `user.role`
- `application.statusHistory` relation → `application.statusHistory` JSON field
- `email.labels` relation → `email.labels` array field

## 2. API Endpoint Updates

### `/api/auth/verify-otp/route.ts`
**Current:**
```typescript
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    userRoles: {
      where: { isActive: true },
    },
  },
})
const primaryRole = user.userRoles[0]
```

**Updated:**
```typescript
const user = await prisma.user.findUnique({
  where: { email },
})
const primaryRole = user.role // Direct access
```

### `/api/auth/me/route.ts`
**Current:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userRoles: {
      where: { isActive: true },
    },
  },
})
```

**Updated:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
})
// User role is now directly on user.role
```

### `/api/admin/users/route.ts`
**Current:**
```typescript
const users = await prisma.user.findMany({
  include: {
    userRoles: {
      where: { isActive: true },
    },
  },
})
```

**Updated:**
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    cohort: true,
    roleAssignedAt: true,
    isActive: true,
    createdAt: true,
  },
})
```

### `/api/admin/users/[id]/role/route.ts`
**Current:**
```typescript
// Deactivate current role
await prisma.userRole.updateMany({
  where: { userId: params.id, isActive: true },
  data: { isActive: false },
})

// Create new role
await prisma.userRole.create({
  data: {
    userId: params.id,
    role: newRole,
    cohort,
    assignedBy: adminId,
    notes,
  },
})
```

**Updated:**
```typescript
// Use the helper function or direct update
await prisma.$executeRaw`
  SELECT update_user_role(
    ${params.id}::text,
    ${newRole}::text,
    ${cohort}::text,
    ${adminId}::text,
    ${notes}::text
  )
`

// Or direct update with history
const user = await prisma.user.findUnique({
  where: { id: params.id },
})

await prisma.user.update({
  where: { id: params.id },
  data: {
    role: newRole,
    cohort,
    roleAssignedAt: new Date(),
    roleAssignedBy: adminId,
    roleNotes: notes,
    roleHistory: {
      push: {
        role: user.role,
        cohort: user.cohort,
        assignedAt: user.roleAssignedAt,
        assignedBy: user.roleAssignedBy,
        endedAt: new Date(),
        notes: user.roleNotes,
      },
    },
  },
})
```

## 3. Type Updates

### `/app/types/auth.ts`
**Add:**
```typescript
export interface UserWithRole extends User {
  role: Role
  cohort?: string | null
  roleAssignedAt: Date
  roleAssignedBy?: string | null
  roleNotes?: string | null
  roleHistory?: RoleHistoryEntry[]
}

export interface RoleHistoryEntry {
  role: Role
  cohort?: string | null
  assignedAt: Date
  assignedBy?: string | null
  endedAt?: Date | null
  notes?: string | null
}
```

### Update SafeUser type:
```typescript
export interface SafeUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  role: Role // Direct role instead of roles array
  cohort?: string | null
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 4. Context Updates

### `/app/lib/contexts/AuthContext.tsx`
**Current:**
```typescript
const hasRole = (role: Role): boolean => {
  if (!user) return false
  return user.roles.some(r => 
    r.role === role && 
    r.isActive
  )
}
```

**Updated:**
```typescript
const hasRole = (role: Role): boolean => {
  if (!user) return false
  return user.role === role
}
```

## 5. Component Updates

### All components using `user.currentRole`
No changes needed - `currentRole` can map directly to `user.role`

### Dashboard components checking roles:
**Current:**
```typescript
{user.roles.map(role => (
  <div key={role.id}>{role.role}</div>
))}
```

**Updated:**
```typescript
<div>{user.role}</div>
{user.roleHistory && user.roleHistory.map((entry, idx) => (
  <div key={idx}>Previous: {entry.role}</div>
))}
```

## 6. Database Query Optimizations

### Before (with JOINs):
```typescript
// Slow query with multiple JOINs
const users = await prisma.user.findMany({
  include: {
    userRoles: {
      where: { isActive: true },
      include: {
        assignedByUser: true,
      },
    },
    applications: {
      include: {
        statusHistory: true,
      },
    },
  },
})
```

### After (direct access):
```typescript
// Fast query with direct fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    role: true,
    cohort: true,
    applications: {
      select: {
        id: true,
        status: true,
        statusHistory: true, // JSON field
      },
    },
  },
})
```

## 7. Migration Testing Checklist

- [ ] All authentication flows work
- [ ] Role-based access control functions
- [ ] Admin can change user roles
- [ ] Role history is preserved
- [ ] Application status updates work
- [ ] Email labels function correctly
- [ ] No broken queries
- [ ] Performance improved

## 8. Performance Metrics to Track

### Before Migration:
- User list query: ~200ms
- Role check: ~50ms
- Application with history: ~150ms

### Expected After Migration:
- User list query: ~100ms (-50%)
- Role check: ~10ms (-80%)
- Application with history: ~75ms (-50%)

## 9. Rollback Triggers

Rollback if any of these occur:
- Authentication failures > 1%
- Query errors in production
- Data inconsistencies detected
- Performance degradation

## 10. Gradual Migration Strategy

### Phase 1: Add new columns (Week 1)
- Add columns without removing old tables
- Update code to write to both old and new structure

### Phase 2: Read from new structure (Week 2)
- Update queries to read from new columns
- Keep old tables as backup

### Phase 3: Remove old tables (Week 3)
- After confirming stability, drop old tables
- Clean up backup tables

This approach minimizes risk and allows for easy rollback at any phase.