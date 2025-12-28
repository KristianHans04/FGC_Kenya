/**
 * @file app/api/admin/users/[id]/route.ts
 * @description Individual admin user management API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/users/[id]
 * Get a specific user for admin review
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Authenticate admin request
    const authResult = await requireAdminOrSuper(request)
    if (authResult) return authResult

    const authenticatedRequest = request as AuthenticatedRequest
    const { user } = authenticatedRequest
    const { id } = await params

    if (!user) {
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

    // Get user with related data
    const userData = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            applications: true,
            sessions: true,
          },
        },
      },
    })

    if (!userData) {
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

    // Create audit log
    await createAuditLog(
      'ADMIN_VIEWED_USER',
      'User',
      userData.id,
      { email: userData.email },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: userData,
      } as ApiResponse<typeof userData>)
    )

    return response
  } catch (error) {
    console.error('Get admin user error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch user',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * PUT /api/admin/users/[id]/role
 * Update user role
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) return rateLimitResult

    // Authenticate admin request
    const authResult = await requireAdminOrSuper(request)
    if (authResult) return authResult

    const authenticatedRequest = request as AuthenticatedRequest
    const { user } = authenticatedRequest
    const { id } = await params

    if (!user) {
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

    // Parse and validate request body
    const body = await request.json()
    const { role } = body

    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid role specified',
            },
          },
          { status: 400 }
        )
      )
    }

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true },
    })

    if (!currentUser) {
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

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    // Create audit log
    await createAuditLog(
      'USER_ROLE_CHANGED',
      'User',
      updatedUser.id,
      {
        previousRole: currentUser.role,
        newRole: role,
        email: currentUser.email,
      },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User role updated successfully',
      } as ApiResponse<typeof updatedUser>)
    )

    return response
  } catch (error) {
    console.error('Update user role error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to update user role',
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