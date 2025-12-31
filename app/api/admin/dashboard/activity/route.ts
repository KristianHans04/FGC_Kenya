/**
 * @file app/api/admin/dashboard/activity/route.ts
 * @description Get recent admin dashboard activity
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/admin/dashboard/activity
 * Get recent activity for dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate admin request
    const authResult = await requireAdminOrSuper(request)
    if (authResult) return authResult

    const authenticatedRequest = request as AuthenticatedRequest
    const { user } = authenticatedRequest

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

    // Get recent activity from audit log
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        admin: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    // Format activity for dashboard
    const formattedActivity = recentActivity.map((log: any) => {
      let description = ''
      let type: 'application' | 'user' | 'review' = 'application'

      switch (log.action) {
        case 'APPLICATION_CREATED':
          description = `New application submitted by ${log.user?.firstName || 'Unknown user'}`
          type = 'application'
          break
        case 'APPLICATION_SUBMITTED':
          description = `Application submitted for review`
          type = 'application'
          break
        case 'APPLICATION_STATUS_CHANGED':
          description = `Application status updated`
          type = 'review'
          break
        case 'USER_CREATED':
          description = `New user account created`
          type = 'user'
          break
        case 'USER_ROLE_CHANGED':
          description = `User role updated by ${log.admin?.firstName || 'Admin'}`
          type = 'user'
          break
        default:
          description = `${log.action.replace('_', ' ').toLowerCase()}`
          type = 'application'
      }

      return {
        id: log.id,
        type,
        description,
        timestamp: log.createdAt.toISOString(),
        user: log.admin?.firstName ? `${log.admin.firstName} ${log.admin.lastName || ''}`.trim() : undefined,
      }
    })

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: formattedActivity,
      } as ApiResponse<typeof formattedActivity>)
    )

    return response
  } catch (error) {
    console.error('Get dashboard activity error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch dashboard activity',
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