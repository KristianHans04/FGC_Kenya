/**
 * @file app/api/admin/dashboard/stats/route.ts
 * @description Get admin dashboard statistics
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
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

    // Get dashboard statistics
    const [totalUsers, totalApplications, pendingApplications, recentApplications, activeAdmins] = await Promise.all([
      prisma.user.count(),
      prisma.application.count({ where: { season: '2026' } }),
      prisma.application.count({
        where: {
          season: '2026',
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
        }
      }),
      prisma.application.count({
        where: {
          season: '2026',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: { in: ['ADMIN', 'SUPER_ADMIN'] },
              isActive: true,
            },
          },
          isActive: true,
        },
      }),
    ])

    const stats = {
      totalUsers,
      totalApplications,
      pendingApplications,
      recentApplications,
      activeAdmins,
    }

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: stats,
      } as ApiResponse<typeof stats>)
    )

    return response
  } catch (error) {
    console.error('Get dashboard stats error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch dashboard statistics',
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