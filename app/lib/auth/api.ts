/**
 * @file app/lib/auth/api.ts
 * @description API route authentication helpers without middleware
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
}

/**
 * Verify JWT token and extract user information
 * @param token - JWT token to verify
 * @returns User information or null if invalid
 */
async function verifyToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Authenticate API request without middleware
 * @param request - Next.js request object
 * @returns User if authenticated, error response if not
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  // Get token from cookie or Authorization header
  const token = request.cookies.get('auth_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      },
      { status: 401 }
    )
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      },
      { status: 401 }
    )
  }

  return { user }
}

/**
 * Get current authenticated user from request
 * @param request - Optional NextRequest object (uses headers if not provided)
 * @returns User information or null if not authenticated
 */
export async function getCurrentUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // If no request provided, try to get from headers
    if (!request) {
      return null
    }
    
    const authResult = await authenticateRequest(request)
    
    // If authentication failed, return null
    if (authResult instanceof NextResponse) {
      return null
    }
    
    return authResult.user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

/**
 * Require specific roles for API access
 * @param request - Next.js request object
 * @param allowedRoles - Array of allowed roles
 * @returns User if authorized, error response if not
 */
export async function requireRoles(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await authenticateRequest(request)
  
  // If authentication failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      },
      { status: 403 }
    )
  }

  return { user }
}

/**
 * Helper for admin-only API routes
 */
export async function requireAdmin(request: NextRequest) {
  return requireRoles(request, ['ADMIN', 'SUPER_ADMIN'])
}

/**
 * Helper for any authenticated user
 */
export async function requireAuth(request: NextRequest) {
  return authenticateRequest(request)
}