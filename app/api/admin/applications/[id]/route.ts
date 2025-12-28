/**
 * @file app/api/admin/applications/[id]/route.ts
 * @description Individual admin application review API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrSuper, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import { reviewApplicationSchema } from '@/app/lib/validations/application'
import { sendApplicationStatusEmail } from '@/app/lib/email'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { Application, ApplicationStatus } from '@/app/types/application'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/admin/applications/[id]
 * Get a specific application for admin review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Authenticate admin request
    const authResult = await requireAdminOrSuper(request)
    if (authResult) return authResult

    const authenticatedRequest = request as AuthenticatedRequest
    const { user } = authenticatedRequest
    const { id } = await params

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

    // Get application with full details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!application) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND' as ErrorCode,
              message: 'Application not found',
            },
          },
          { status: 404 }
        )
      )
    }

    // Create audit log
    await createAuditLog(
      'ADMIN_VIEWED_APPLICATION',
      'Application',
      application.id,
      { status: application.status },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: application,
      } as ApiResponse<Application & { user: any; statusHistory: any[] }>)
    )

    return response
  } catch (error) {
    console.error('Get admin application error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to fetch application',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * PUT /api/admin/applications/[id]/review
 * Review and update application status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params

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
    const validationResult = reviewApplicationSchema.safeParse(body)

    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid review data',
              details: validationResult.error.issues,
            },
          },
          { status: 400 }
        )
      )
    }

    const reviewData = validationResult.data

    // Get application with user details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    })

    if (!application) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND' as ErrorCode,
              message: 'Application not found',
            },
          },
          { status: 404 }
        )
      )
    }

    // Update application in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application
      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          status: reviewData.status as ApplicationStatus,
          reviewNotes: reviewData.notes || application.reviewNotes,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          interviewDate: reviewData.interviewDate ? new Date(reviewData.interviewDate) : application.interviewDate,
          interviewNotes: reviewData.interviewNotes || application.interviewNotes,
          finalScore: reviewData.finalScore || application.finalScore,
        },
        include: {
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      // Create status history entry
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          previousStatus: application.status,
          newStatus: reviewData.status as ApplicationStatus,
          notes: reviewData.notes,
          changedBy: user.id,
        },
      })

      return updatedApplication
    })

    // Send email notification to applicant
    if (application.user.email) {
      await sendApplicationStatusEmail(
        application.email,
        application.user.firstName || application.firstName,
        reviewData.status as ApplicationStatus,
        reviewData.notes,
        reviewData.interviewDate ? new Date(reviewData.interviewDate) : undefined
      )
    }

    // Create audit log
    await createAuditLog(
      'APPLICATION_REVIEWED',
      'Application',
      result.id,
      {
        previousStatus: application.status,
        newStatus: reviewData.status,
        hasNotes: !!reviewData.notes,
        hasInterviewDate: !!reviewData.interviewDate,
      },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: result,
        message: 'Application review updated successfully',
      } as ApiResponse<Application>)
    )

    return response
  } catch (error) {
    console.error('Review application error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to update application review',
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
