/**
 * @file lib/middleware/auth.ts
 * @description Authentication middleware for API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, validateSession } from '@/app/lib/auth/jwt'
import type { UserRole, JWTPayload } from '@/app/types/auth'
import prisma from '@/app/lib/db'

/**
 * Extended NextRequest with auth context
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
  }
  sessionId?: string
}

/**
 * Authentication middleware result
 */
export interface AuthResult {
  success: boolean
  user?: { id: string; email: string; role: UserRole }
  sessionId?: string
  error?: {
    code: string
    message: string
    status: number
  }
}

/**
 * Extract and validate JWT token from request
 * @param request - NextRequest object
 * @returns AuthResult with user info or error
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined
    
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // Remove 'Bearer '
    } else {
      // Try to get token from cookie
      const cookieToken = request.cookies.get('auth_token')
      if (cookieToken) {
        token = cookieToken.value
      }
    }
    
    if (!token) {
      return {
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token required',
          status: 401,
        },
      }
    }

    // Verify JWT token
    const payload = await verifyAccessToken(token)
    if (!payload) {
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
          status: 401,
        },
      }
    }

    // Validate session is still active
    const sessionValidation = await validateSession(payload.sessionId)
    if (!sessionValidation || !sessionValidation.isValid) {
      return {
        success: false,
        error: {
          code: 'SESSION_INVALID',
          message: 'Session is no longer valid',
          status: 401,
        },
      }
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { 
        id: true, 
        email: true,
        role: true,
        isActive: true 
      },
    })

    if (!user) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found',
          status: 401,
        },
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is deactivated',
          status: 403,
        },
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: (user.role || 'USER') as UserRole,
      },
      sessionId: payload.sessionId,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        status: 500,
      },
    }
  }
}

/**
 * Higher-order function to create role-based authentication middleware
 * @param allowedRoles - Array of allowed user roles
 * @returns Middleware function
 */
export function requireAuth(allowedRoles?: UserRole[]) {
  return async function authMiddleware(
    request: NextRequest,
    context?: { params?: Record<string, string> }
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

    // Check role authorization if roles specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions for this action',
          },
        },
        { status: 403 }
      )
    }

    // Attach user to request for downstream handlers
    ;(request as AuthenticatedRequest).user = user
    ;(request as AuthenticatedRequest).sessionId = authResult.sessionId

    // Continue to route handler
    return undefined
  }
}

/**
 * Middleware specifically for admin-only routes
 */
export const requireAdmin = requireAuth(['ADMIN' as any, 'SUPER_ADMIN' as any])

/**
 * Middleware for any authenticated user
 */
export const requireAnyAuth = requireAuth()

/**
 * Middleware for users with specific roles (convenience functions)
 */
export const requireUser = requireAuth(['USER' as any, 'ADMIN' as any, 'SUPER_ADMIN' as any])
export const requireAdminOrSuper = requireAuth(['ADMIN' as any, 'SUPER_ADMIN' as any])
export const requireSuperAdmin = requireAuth(['SUPER_ADMIN' as any])

/**
 * Utility function to get authenticated user from request
 * @param request - Authenticated request
 * @returns User object
 * @throws Error if user not authenticated
 */
export function getAuthenticatedUser(request: AuthenticatedRequest): {
  id: string
  email: string
  role: UserRole
} {
  if (!request.user) {
    throw new Error('User not authenticated')
  }
  return request.user
}

/**
 * Create audit log entry for authenticated actions
 * @param action - Audit action type
 * @param entityType - Type of entity being acted upon
 * @param entityId - ID of the entity
 * @param details - Additional details
 * @param request - Authenticated request
 */
export async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> | null,
  request: AuthenticatedRequest
): Promise<void> {
  try {
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'

    await prisma.auditLog.create({
      data: {
        action: action as any,
        entityType,
        entityId,
        details: details as any,
        userId: request.user?.id,
        adminId: request.user?.role === 'ADMIN' || request.user?.role === 'SUPER_ADMIN'
                ? request.user?.id
                : null,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main flow
  }
}
