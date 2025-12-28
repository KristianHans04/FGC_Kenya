/**
 * @file app/api/admin/users/route.ts
 * @description Admin user management API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/admin/users
 * Get paginated list of users
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || undefined
    const status = searchParams.get('status') || undefined

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (status) {
      where.isActive = status === 'active'
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const result = {
      users,
      total,
      page,
      limit,
      totalPages,
    }

    // Create audit log
    await createAuditLog(
      'ADMIN_VIEWED_USER',
      'User',
      'admin-list',
      { filters: { search, role, status }, count: users.length },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: result,
      } as ApiResponse<typeof result>)
    )

    return response
  } catch (error) {
    console.error('Get admin users error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch users',
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