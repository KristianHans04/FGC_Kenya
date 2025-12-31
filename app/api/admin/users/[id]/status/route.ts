/**
 * @file app/api/admin/users/[id]/status/route.ts
 * @description Update user active status
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
 * PUT /api/admin/users/[id]/status
 * Update user active status
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
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'isActive must be a boolean',
            },
          },
          { status: 400 }
        )
      )
    }

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true, email: true },
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

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userRoles: {
          where: { isActive: true },
          select: { role: true, cohort: true },
        },
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    // If deactivating user, invalidate all their sessions
    if (!isActive) {
      await prisma.session.updateMany({
        where: { userId: id },
        data: { isValid: false },
      })
    }

    // Create audit log
    await createAuditLog(
      'USER_UPDATED',
      'User',
      updatedUser.id,
      {
        field: 'isActive',
        previousValue: currentUser.isActive,
        newValue: isActive,
        email: currentUser.email,
      },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: updatedUser,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      } as ApiResponse<typeof updatedUser>)
    )

    return response
  } catch (error) {
    console.error('Update user status error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to update user status',
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