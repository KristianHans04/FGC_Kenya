/**
 * @file app/api/admin/users/[id]/route.ts
 * @description Delete user API route
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
 * DELETE /api/admin/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(
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

    // Prevent admins from deleting themselves
    if (id === user.id) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'You cannot delete your own account',
            },
          },
          { status: 403 }
        )
      )
    }

    // Get user data for audit log before deletion
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true },
    })

    if (!userToDelete) {
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

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    })

    // Create audit log
    await createAuditLog(
      'USER_DELETED',
      'User',
      id,
      {
        email: userToDelete.email,
        role: userToDelete.role,
      },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      } as ApiResponse<{ message: string }>)
    )

    return response
  } catch (error) {
    console.error('Delete user error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to delete user',
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