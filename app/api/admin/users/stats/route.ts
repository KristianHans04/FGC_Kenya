/**
 * @file app/api/admin/users/stats/route.ts
 * @description Get user statistics for admin dashboard
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/admin/users/stats
 * Get user statistics
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

    // Get user statistics
    const [total, active, admins, recentSignups] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ 
        where: { 
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
          isActive: true,
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ])

    const stats = {
      total,
      active,
      admins,
      recentSignups,
    }

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: stats,
      } as ApiResponse<typeof stats>)
    )

    return response
  } catch (error) {
    console.error('Get user stats error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch user statistics',
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