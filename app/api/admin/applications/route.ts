/**
 * @file app/api/admin/applications/route.ts
 * @description Admin application management API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import { applicationFilterSchema, bulkStatusUpdateSchema } from '@/app/lib/validations/application'
import { sendApplicationStatusEmail } from '@/app/lib/email'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { Application, PaginatedApplications, ApplicationFilters } from '@/app/types/application'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/admin/applications
 * Get paginated list of applications with filters
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
    const filters: Partial<ApplicationFilters> = {
      status: (searchParams.get('status') as any) || undefined,
      season: searchParams.get('season') || '2026',
      county: searchParams.get('county') || undefined,
      experience: searchParams.get('experience') as any || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
      sortBy: (searchParams.get('sortBy') as ApplicationFilters['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as ApplicationFilters['sortOrder']) || 'desc',
    }

    // Validate filters
    const validationResult = applicationFilterSchema.safeParse(filters)
    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid filter parameters',
              details: validationResult.error.issues,
            },
          },
          { status: 400 }
        )
      )
    }

    const { page, limit, sortBy, sortOrder, ...whereFilters } = validationResult.data

    // Build where clause
    const where: any = {
      season: whereFilters.season || '2026',
    }

    if (whereFilters.status) {
      where.status = Array.isArray(whereFilters.status)
        ? { in: whereFilters.status }
        : whereFilters.status
    }

    if (whereFilters.county) {
      where.county = whereFilters.county
    }

    if (whereFilters.experience) {
      where.experience = whereFilters.experience
    }

    if (whereFilters.search) {
      where.OR = [
        { firstName: { contains: whereFilters.search, mode: 'insensitive' } },
        { lastName: { contains: whereFilters.search, mode: 'insensitive' } },
        { email: { contains: whereFilters.search, mode: 'insensitive' } },
        { school: { contains: whereFilters.search, mode: 'insensitive' } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with count
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5, // Last 5 status changes
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const result = {
      applications: applications as any,
      total,
      page,
      limit,
      totalPages,
    }

    // Create audit log
    await createAuditLog(
      'ADMIN_VIEWED_APPLICATION',
      'Application',
      'admin-list',
      { filters: whereFilters, count: applications.length },
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
    console.error('Get admin applications error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch applications',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * POST /api/admin/applications/bulk-update
 * Bulk update application statuses
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) return rateLimitResult

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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = bulkStatusUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid request data',
              details: validationResult.error.issues,
            },
          },
          { status: 400 }
        )
      )
    }

    const { applicationIds, status, notes } = validationResult.data

    // Update applications in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updates = []

      for (const applicationId of applicationIds) {
        // Get current application
        const application = await tx.application.findUnique({
          where: { id: applicationId },
          include: { user: { select: { firstName: true, email: true } } },
        })

        if (!application) continue

        // Update application
        const updated = await tx.application.update({
          where: { id: applicationId },
          data: { status: status as any },
          include: { statusHistory: true },
        })

        // Create status history
        await tx.applicationStatusHistory.create({
          data: {
            applicationId,
            previousStatus: application.status,
            newStatus: status as any,
            notes,
            changedBy: user.id,
          },
        })

        updates.push(updated)

        // Send email notification
        await sendApplicationStatusEmail(
          application.email,
          application.user.firstName || application.firstName,
          status as any,
          notes,
          undefined // No interview date for bulk updates
        )
      }

      return updates
    })

    // Create audit log
    await createAuditLog(
      'ADMIN_BULK_ACTION',
      'Application',
      'bulk-status-update',
      { status, count: result.length, applicationIds },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: result,
        message: `Successfully updated ${result.length} applications`,
      } as ApiResponse<any[]>)
    )

    return response
  } catch (error) {
    console.error('Bulk update applications error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to update applications',
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
