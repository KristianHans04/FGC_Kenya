/**
 * @file app/api/admin/users/[userId]/impersonate/route.ts
 * @description User impersonation API endpoint for super admins
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import { createSession } from '@/app/lib/auth'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { SafeUser, AuthResponse } from '@/app/types/auth'
import { getDashboardRoute } from '@/app/lib/constants/navigation'

interface RouteParams {
  params: Promise<{ userId: string }>
}

/**
 * POST /api/admin/users/[userId]/impersonate
 * Start impersonating a user (super admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
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

    // Only super admins can impersonate
    if (authResult.user.role !== 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Only super admins can impersonate users',
            },
          },
          { status: 403 }
        )
      )
    }

    const { userId } = await params
    
    // Cannot impersonate yourself
    if (userId === authResult.user.id) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST' as ErrorCode,
              message: 'Cannot impersonate yourself',
            },
          },
          { status: 400 }
        )
      )
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        school: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    })

    if (!targetUser) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND' as ErrorCode,
              message: 'User not found',
            },
          },
          { status: 404 }
        )
      )
    }

    // Cannot impersonate other super admins
    if (targetUser.role === 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Cannot impersonate other super admins',
            },
          },
          { status: 403 }
        )
      )
    }

    // Create impersonation session
    const { session, accessToken, refreshToken } = await createSession(
      targetUser.id,
      targetUser.email,
      targetUser.role as any,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') || undefined
    )

    // Store impersonation info in userAgent field as a workaround
    const impersonationInfo = JSON.stringify({
      impersonating: true,
      impersonatedBy: authResult.user.id,
      originalEmail: authResult.user.email,
      originalRole: authResult.user.role,
      startedAt: new Date().toISOString(),
    })
    
    await prisma.session.update({
      where: { id: session.id },
      data: {
        userAgent: `IMPERSONATION:::${impersonationInfo}:::${request.headers.get('user-agent') || 'Unknown'}`,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'SESSION_CREATED',
        entityType: 'User',
        entityId: targetUser.id,
        details: {
          impersonatedUser: targetUser.email,
          impersonatedById: authResult.user.id,
          impersonatedByEmail: authResult.user.email,
        },
        userId: authResult.user.id,
        adminId: authResult.user.id,
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    // Create safe user object
    const safeUser: SafeUser = {
      id: targetUser.id,
      email: targetUser.email,
      firstName: targetUser.firstName,
      lastName: targetUser.lastName,
      school: targetUser.school,
      role: targetUser.role as any,
      currentRole: targetUser.role as any,
      emailVerified: targetUser.emailVerified,
    }

    // Create auth response
    const authResponse: AuthResponse = {
      user: safeUser,
      token: accessToken,
      refreshToken,
      expiresAt: session.expiresAt.toISOString(),
      redirectUrl: getDashboardRoute(targetUser.role || 'USER'),
    }

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: authResponse,
      } as ApiResponse<AuthResponse>)
    )

    // Set cookies for impersonated session
    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    // Set impersonation flag cookie (readable by client)
    response.cookies.set('impersonating', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    response.cookies.set('original_email', authResult.user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Impersonate user error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to impersonate user',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * DELETE /api/admin/users/[userId]/impersonate
 * Stop impersonating and return to original session
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Get current session
    const authResult = await authenticateRequest(request)
    if (!authResult.user || !authResult.sessionId) {
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

    // Check if currently impersonating
    const currentSession = await prisma.session.findUnique({
      where: { id: authResult.sessionId },
      select: { userAgent: true },
    })

    // Parse impersonation data from userAgent
    let metadata: any = null
    if (currentSession?.userAgent?.startsWith('IMPERSONATION:::')) {
      const parts = currentSession.userAgent.split(':::')
      if (parts.length >= 2) {
        try {
          metadata = JSON.parse(parts[1])
        } catch (e) {
          console.error('Failed to parse impersonation metadata:', e)
        }
      }
    }
    
    if (!metadata?.impersonating) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST' as ErrorCode,
              message: 'Not currently impersonating',
            },
          },
          { status: 400 }
        )
      )
    }

    // Invalidate impersonation session
    await prisma.session.update({
      where: { id: authResult.sessionId },
      data: { isValid: false },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'SESSION_REVOKED',
        entityType: 'User',
        entityId: authResult.user.id,
        details: {
          impersonatedUser: authResult.user.email,
          originalUserId: metadata.impersonatedBy,
          originalEmail: metadata.originalEmail,
          duration: new Date().getTime() - new Date(metadata.startedAt).getTime(),
        },
        userId: metadata.impersonatedBy,
        adminId: metadata.impersonatedBy,
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          message: 'Impersonation ended',
          redirectUrl: '/admin/super/users',
        },
      })
    )

    // Clear all cookies
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('impersonating', '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('original_email', '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Stop impersonation error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to stop impersonation',
          },
        },
        { status: 500 }
      )
    )
  }
}