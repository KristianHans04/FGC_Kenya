/**
 * @file app/api/admin/users/[userId]/route.ts
 * @description User CRUD operations API route
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

interface RouteParams {
  params: Promise<{ userId: string }>
}

/**
 * GET /api/admin/users/[userId]
 * Get a single user by ID (admin only)
 */
export async function GET(
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

    const { userId } = await params
    
    // Check for includeAll query param
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('includeAll') === 'true'

    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: includeAll ? {
        applications: {
          orderBy: { createdAt: 'desc' },
        },
        articles: {
          orderBy: { createdAt: 'desc' },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      } : undefined,
    })

    if (!user) {
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

    // Add cohort memberships (mock data for now)
    const userWithCohorts = {
      ...user,
      cohortMemberships: [],
      payments: [],
      activityLogs: includeAll && 'auditLogs' in user ? (user as any).auditLogs : [],
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: { user: userWithCohorts },
      })
    )
  } catch (error) {
    console.error('Get user error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to get user',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * PUT /api/admin/users/[userId]
 * Update a user (admin only)
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
    const { userId } = await params

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

    // Parse request body
    const body = await request.json()
    
    // Build update data - only include fields that were provided
    const updateData: any = {}
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.school !== undefined) updateData.school = body.school
    if (body.year !== undefined) updateData.year = body.year
    if (body.role !== undefined) updateData.role = body.role
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.emailVerified !== undefined) updateData.emailVerified = body.emailVerified
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Create audit log
    await createAuditLog(
      'USER_UPDATED',
      'User',
      userId,
      {
        updatedFields: Object.keys(updateData),
        changes: updateData,
      },
      authenticatedRequest
    )

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: { user: updatedUser },
      })
    )
  } catch (error) {
    console.error('Update user error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to update user',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * DELETE /api/admin/users/[userId]
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
    const { userId } = await params

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
    if (userId === user.id) {
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
      where: { id: userId },
      select: { 
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
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
      where: { id: userId },
    })

    // Create audit log
    await createAuditLog(
      'USER_DELETED',
      'User',
      userId,
      {
        email: userToDelete.email,
        name: `${userToDelete.firstName || ''} ${userToDelete.lastName || ''}`.trim(),
        role: userToDelete.role || 'USER',
      },
      authenticatedRequest
    )

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      })
    )
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