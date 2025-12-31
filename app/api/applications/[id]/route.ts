/**
 * @file app/api/applications/[id]/route.ts
 * @description Individual application management API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAnyAuth, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import { applicationUpdateSchema, reviewApplicationSchema } from '@/app/lib/validations/application'
import { sendApplicationStatusEmail } from '@/app/lib/email'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { Application, ApplicationStatus } from '@/app/types/application'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/applications/[id]
 * Get a specific application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await requireAnyAuth(request)
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

    // Get application with ownership check
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own applications
      },
      include: {
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
      'APPLICATION_VIEWED',
      'Application',
      application.id,
      null,
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: application,
      } as ApiResponse<Application>)
    )

    return response
  } catch (error) {
    console.error('Get application error:', error)

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
 * PUT /api/applications/[id]
 * Update an application (for drafts only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) return rateLimitResult

    // Authenticate request
    const authResult = await requireAnyAuth(request)
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
    const validationResult = applicationUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR' as ErrorCode,
              message: 'Invalid application data',
              details: validationResult.error.issues,
            },
          },
          { status: 400 }
        )
      )
    }

    const updateData = validationResult.data

    // Get application with ownership check
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingApplication) {
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

    // Only allow updates to draft applications
    if (existingApplication.status !== 'DRAFT') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_APPLICATION_STATUS' as ErrorCode,
              message: 'Only draft applications can be updated',
            },
          },
          { status: 400 }
        )
      )
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        statusHistory: true,
      },
    })

    // Create audit log
    await createAuditLog(
      'APPLICATION_UPDATED',
      'Application',
      updatedApplication.id,
      { fields: Object.keys(updateData) },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: updatedApplication,
        message: 'Application updated successfully',
      } as ApiResponse<Application>)
    )

    return response
  } catch (error) {
    console.error('Update application error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to update application',
          },
        },
        { status: 500 }
      )
    )
  }
}

/**
 * POST /api/applications/[id]/submit
 * Submit an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) return rateLimitResult

    // Authenticate request
    const authResult = await requireAnyAuth(request)
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

    // Get application with ownership check
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        user: {
          select: { firstName: true, email: true },
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

    // Check if application can be submitted
    if (application.status !== 'DRAFT') {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_APPLICATION_STATUS' as ErrorCode,
              message: 'Application is not in draft status',
            },
          },
          { status: 400 }
        )
      )
    }

    // Submit application in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Update application status
      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          status: 'SUBMITTED' as ApplicationStatus,
          submittedAt: new Date(),
        },
        include: {
          statusHistory: true,
        },
      })

      // Create status history entry
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          previousStatus: 'DRAFT',
          newStatus: 'SUBMITTED',
          notes: 'Application submitted by user',
          changedBy: user.id,
        },
      })

      return updatedApplication
    })

    // TODO: Send confirmation email
    // await sendApplicationSubmittedEmail(
    //   application.email,
    //   application.user.firstName || application.firstName,
    //   application.id,
    //   application.season
    // )

    // TODO: Send admin notification
    // await sendAdminNewApplicationEmail(
    //   `${application.firstName} ${application.lastName}`,
    //   application.email,
    //   application.id,
    //   application.season
    // )

    // Create audit log
    await createAuditLog(
      'APPLICATION_SUBMITTED',
      'Application',
      result.id,
      { season: result.season },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: result,
        message: 'Application submitted successfully',
      } as ApiResponse<Application>)
    )

    return response
  } catch (error) {
    console.error('Submit application error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to submit application',
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
