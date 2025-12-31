/**
 * @file app/api/admin/users/route.ts
 * @description Admin user management API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { addSecurityHeaders } from '@/app/lib/middleware/security'
import { prisma } from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'

/**
 * GET /api/admin/users
 * Get paginated list of users
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate admin request
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

    const user = authResult.user

    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || undefined
    const status = searchParams.get('status') || undefined
    const includePayments = searchParams.get('includePayments') === 'true'
    const includeCohorts = searchParams.get('includeCohorts') === 'true'

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

    // Build select object based on user role and request
    const select: any = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      school: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    }

    // Super admin gets additional data if requested
    if (user.role === 'SUPER_ADMIN') {
      if (includeCohorts) {
        select.cohortMemberships = {
          select: {
            cohort: true,
            role: true,
            isActive: true,
            joinedAt: true,
          }
        }
      }
      if (includePayments) {
        select.payments = {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            type: true,
            createdAt: true,
          }
        }
      }
    }

    // Execute query with count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select,
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

    // Audit log removed for simplicity

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