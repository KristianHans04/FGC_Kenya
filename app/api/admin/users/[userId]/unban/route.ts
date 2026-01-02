/**
 * @file app/api/admin/users/[userId]/unban/route.ts
 * @description Unban user endpoint
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/admin/users/[userId]/unban
 * Unban a user account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    // Check admin permissions
    if (authResult.user.role !== 'ADMIN' && authResult.user.role !== 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Admin access required',
            },
          },
          { status: 403 }
        )
      )
    }

    // Check if user exists and is banned
    const { userId } = await params
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBanned: true,
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

    if (!targetUser.isBanned) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST' as ErrorCode,
              message: 'User is not banned',
            },
          },
          { status: 400 }
        )
      )
    }

    // Unban the user
    const unbannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        isActive: true,
        updatedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_UNBANNED',
        entityType: 'User',
        entityId: userId,
        userId: authResult.user.id,
        adminId: authResult.user.id,
        details: {
          targetEmail: targetUser.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    })

    // Email notification removed - can be added later if needed

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: {
          message: 'User unbanned successfully',
          user: {
            id: unbannedUser.id,
            email: unbannedUser.email,
            isBanned: unbannedUser.isBanned,
          },
        },
      })
    )
  } catch (error) {
    console.error('Unban user error:', error)
    
    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to unban user',
          },
        },
        { status: 500 }
      )
    )
  }
}