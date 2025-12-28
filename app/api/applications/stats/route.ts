/**
 * @file app/api/applications/stats/route.ts
 * @description Get application statistics for user dashboard
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAnyAuth } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/applications/stats
 * Get application statistics for current user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await requireAnyAuth(request)
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

    // Get user's application statistics
    const [totalApplications, submittedApplications, activeApplications] = await Promise.all([
      prisma.application.count({
        where: { userId: user.id },
      }),
      prisma.application.count({
        where: {
          userId: user.id,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WAITLISTED'] },
        },
      }),
      prisma.application.count({
        where: {
          userId: user.id,
          status: 'DRAFT',
        },
      }),
    ])

    const stats = {
      totalApplications,
      submittedApplications,
      activeApplications,
    }

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: stats,
      } as ApiResponse<typeof stats>)
    )

    return response
  } catch (error) {
    console.error('Get application stats error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch application statistics',
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