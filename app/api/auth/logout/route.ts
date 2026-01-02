/**
 * @file app/api/auth/logout/route.ts
 * @description Logout user and invalidate session
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAnyAuth, createAuditLog } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await requireAnyAuth(request)
    if (authResult) return authResult

    const authenticatedRequest = request as AuthenticatedRequest
    const { user, sessionId } = authenticatedRequest

    if (!user || !sessionId) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED' as ErrorCode,
              message: 'Not authenticated',
            },
          },
          { status: 401 }
        )
      )
    }

    // Invalidate session
    const { invalidateSession } = await import('@/app/lib/auth/jwt')
    await invalidateSession(sessionId)

    // Create audit log
    await createAuditLog(
      'LOGOUT',
      'User',
      user.id,
      null,
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      } as ApiResponse<{ message: string }>)
    )

    // Clear cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Logout failed',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return addSecurityHeaders(new NextResponse(null, { status: 200 }))
}
