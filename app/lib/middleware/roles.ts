/**
 * @file lib/middleware/roles.ts
 * @description Role-based access control middleware for the new role system
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, AuthResult } from './auth'
import { Role, hasPermission } from '@/app/types/auth'
import prisma from '@/app/lib/db'
import type { AuthenticatedRequest } from './auth'

/**
 * Extended authenticated request with role information
 */
export interface RoleAuthenticatedRequest extends AuthenticatedRequest {
  currentRole?: Role
  currentCohort?: string | null
}

/**
 * Get user's role from database
 */
async function getUserRole(userId: string): Promise<Role> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  return (user?.role as Role) || Role.USER
}

/**
 * Require specific role(s) for access
 * @param allowedRoles - Array of allowed roles
 * @param requireCohort - Optionally require cohort membership
 */
export function requireRole(allowedRoles: Role[], requireCohort?: string) {
  return async function roleMiddleware(
    request: NextRequest
  ): Promise<NextResponse | undefined> {
    // First authenticate the request
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      const error = authResult.error!
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.status }
      )
    }

    const { user } = authResult
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Get user's role from database
    const userRole = await getUserRole(user.id)
    
    // Check if user has any of the allowed roles
    const hasAllowedRole = allowedRoles.includes(userRole)
    
    // Check cohort if required
    if (hasAllowedRole && requireCohort) {
      const membership = await prisma.cohortMember.findFirst({
        where: {
          userId: user.id,
          cohort: requireCohort,
          isActive: true
        }
      })
      if (!membership) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_IN_COHORT',
              message: `You are not a member of cohort ${requireCohort}`
            }
          },
          { status: 403 }
        )
      }
    }

    if (!hasAllowedRole) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `This action requires one of these roles: ${allowedRoles.join(', ')}`
          }
        },
        { status: 403 }
      )
    }

    // Get current cohort if user is student or mentor
    let currentCohort: string | null = null
    if (userRole === Role.MENTOR || userRole === Role.STUDENT) {
      const membership = await prisma.cohortMember.findFirst({
        where: {
          userId: user.id,
          isActive: true
        },
        select: { cohort: true }
      })
      currentCohort = membership?.cohort || null
    }

    // Attach role info to request
    const roleRequest = request as RoleAuthenticatedRequest
    roleRequest.user = user
    roleRequest.sessionId = authResult.sessionId
    roleRequest.currentRole = userRole
    roleRequest.currentCohort = currentCohort

    return undefined
  }
}

/**
 * Check if user has specific permission
 */
export function requirePermission(permission: string) {
  return async function permissionMiddleware(
    request: NextRequest
  ): Promise<NextResponse | undefined> {
    // Use requireRole with all roles, then check permission
    const roleCheck = await requireRole(Object.values(Role))(request)
    if (roleCheck) return roleCheck

    const roleRequest = request as RoleAuthenticatedRequest
    const { currentRole } = roleRequest

    if (!currentRole || !hasPermission(currentRole, permission as any)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `You don't have permission to: ${permission}`
          }
        },
        { status: 403 }
      )
    }

    return undefined
  }
}

/**
 * Require cohort membership (for mentors and students)
 */
export function requireCohortMembership(cohort: string, role?: CohortRole) {
  return async function cohortMiddleware(
    request: NextRequest
  ): Promise<NextResponse | undefined> {
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success) {
      const error = authResult.error!
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.status }
      )
    }

    const { user } = authResult
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Check cohort membership
    const membership = await prisma.cohortMember.findFirst({
      where: {
        userId: user.id,
        cohort,
        isActive: true,
        ...(role && { role: role as any })
      }
    })

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_IN_COHORT',
            message: `You are not a ${role || 'member'} of cohort ${cohort}`
          }
        },
        { status: 403 }
      )
    }

    // Attach to request
    const roleRequest = request as RoleAuthenticatedRequest
    roleRequest.user = user
    roleRequest.sessionId = authResult.sessionId
    roleRequest.currentCohort = cohort

    return undefined
  }
}

// Convenience middleware functions for specific roles
export const requireSuperAdmin = requireRole([Role.SUPER_ADMIN])
export const requireAdmin = requireRole([Role.ADMIN])
export const requireAdminOrSuper = requireRole([Role.ADMIN, Role.SUPER_ADMIN])
export const requireMentor = requireRole([Role.MENTOR])
export const requireStudent = requireRole([Role.STUDENT])
export const requireAlumni = requireRole([Role.ALUMNI])
export const requireAnyAuthenticated = requireRole(Object.values(Role))

// Permission-based middleware
export const requireCanViewAllUsers = requirePermission('canViewAllUsers')
export const requireCanManageUsers = requirePermission('canManageUsers')
export const requireCanAssignRoles = requirePermission('canAssignRoles')
export const requireCanViewPayments = requirePermission('canViewPayments')
export const requireCanManageApplications = requirePermission('canManageApplications')
export const requireCanManageMedia = requirePermission('canManageMedia')
export const requireCanSendEmails = requirePermission('canSendEmails')
export const requireCanViewAnalytics = requirePermission('canViewAnalytics')
export const requireCanExportData = requirePermission('canExportData')

/**
 * Check if user can access specific cohort data
 */
export async function canAccessCohort(
  userId: string,
  cohort: string,
  requiredRole?: CohortRole
): Promise<boolean> {
  // Super admins and admins can access all cohorts
  const userRole = await getUserRole(userId)
  if (userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN) {
    return true
  }

  // Check specific cohort membership
  const membership = await prisma.cohortMember.findFirst({
    where: {
      userId,
      cohort,
      isActive: true,
      ...(requiredRole && { role: requiredRole as any })
    }
  })

  return !!membership
}

/**
 * Get user's accessible cohorts
 */
export async function getUserCohorts(userId: string): Promise<string[]> {
  const userRole = await getUserRole(userId)
  
  // Super admins and admins can access all cohorts
  if (userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN) {
    const allCohorts = await prisma.cohortMember.findMany({
      distinct: ['cohort'],
      select: { cohort: true }
    })
    return allCohorts.map(c => c.cohort)
  }

  // Get user's specific cohorts
  const memberships = await prisma.cohortMember.findMany({
    where: {
      userId,
      isActive: true
    },
    select: { cohort: true }
  })

  return [...new Set(memberships.map(m => m.cohort))]
}

/**
 * Validate cohort-restricted content access
 */
export async function validateCohortAccess(
  userId: string,
  contentCohort: string | null
): Promise<boolean> {
  // If content has no cohort restriction, it's public
  if (!contentCohort) return true

  // Check if user can access this cohort
  return canAccessCohort(userId, contentCohort)
}

// Export CohortRole for use in middleware
export enum CohortRole {
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT'
}