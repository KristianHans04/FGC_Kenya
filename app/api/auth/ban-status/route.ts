/**
 * @file app/api/auth/ban-status/route.ts
 * @description Check ban status for authenticated user
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import prisma from '@/app/lib/db'
import { addSecurityHeaders } from '@/app/lib/middleware/security'

/**
 * GET /api/auth/ban-status
 * Get ban details for the current user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Not authenticated',
            },
          },
          { status: 401 }
        )
      )
    }

    // Get ban details from database
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        isBanned: true,
        bannedAt: true,
        bannedBy: true,
        banReason: true,
        banExpiresAt: true,
      },
    })

    if (!userDetails?.isBanned) {
      return addSecurityHeaders(
        NextResponse.json({
          success: true,
          banned: false,
        })
      )
    }

    // Get banner details
    let bannerDetails = null
    if (userDetails.bannedBy) {
      const banner = await prisma.user.findUnique({
        where: { id: userDetails.bannedBy },
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      })
      bannerDetails = banner
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        banned: true,
        details: {
          bannedAt: userDetails.bannedAt,
          bannedBy: bannerDetails || {
            email: 'system@fgckenya.com',
            firstName: 'System',
            lastName: 'Administrator',
          },
          reason: userDetails.banReason || 'Violation of community guidelines',
          expiresAt: userDetails.banExpiresAt,
        },
      })
    )
  } catch (error) {
    console.error('Ban status check error:', error)
    
    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to check ban status',
          },
        },
        { status: 500 }
      )
    )
  }
}