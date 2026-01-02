/**
 * @file app/api/admin/users/[userId]/ban/route.ts
 * @description Ban user endpoint
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * POST /api/admin/users/[userId]/ban
 * Ban a user account
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

    // Parse optional body for reason
    let reason = 'Violation of community guidelines'
    try {
      const body = await request.json()
      if (body.reason) reason = body.reason
    } catch {}


    // Check if user exists and is not already banned
    const { userId } = await params
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
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

    if (targetUser.isBanned) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST' as ErrorCode,
              message: 'User is already banned',
            },
          },
          { status: 400 }
        )
      )
    }

    // Only super admins can ban admins
    if (targetUser.role === 'ADMIN' && authResult.user.role !== 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Only super admins can ban other admins',
            },
          },
          { status: 403 }
        )
      )
    }

    // Prevent banning super admins
    if (targetUser.role === 'SUPER_ADMIN') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN' as ErrorCode,
              message: 'Cannot ban super admins',
            },
          },
          { status: 403 }
        )
      )
    }

    // Ban the user
    const bannedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Invalidate all user sessions
    await prisma.session.updateMany({
      where: { userId: userId },
      data: { isValid: false },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_BANNED',
        entityType: 'User',
        entityId: userId,
        userId: authResult.user.id,
        adminId: authResult.user.id,
        details: { 
          reason,
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
          message: 'User banned successfully',
          user: {
            id: bannedUser.id,
            email: bannedUser.email,
            isBanned: bannedUser.isBanned,
          },
        },
      })
    )
  } catch (error) {
    console.error('Ban user error:', error)
    
    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to ban user',
          },
        },
        { status: 500 }
      )
    )
  }
}