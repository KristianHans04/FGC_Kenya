/**
 * @file app/api/applications/route.ts
 * @description Application management API routes
 * @author Team Kenya Dev
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAnyAuth, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit, addSecurityHeaders } from '@/app/lib/middleware/security'
import { applicationFormSchema } from '@/app/lib/validations/application'
import prisma from '@/app/lib/db'
import type { ApiResponse, ErrorCode } from '@/app/types/api'
import type { Application, ApplicationStatus } from '@/app/types/application'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/applications
 * Get user's applications
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

    // Get user's applications
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Create audit log
    await createAuditLog(
      'APPLICATION_VIEWED',
      'Application',
      'user-applications',
      { count: applications.length },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: applications as any,
      })
    )

    return response
  } catch (error) {
    console.error('Get applications error:', error)

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
 * POST /api/applications
 * Create a new application
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) return rateLimitResult

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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = applicationFormSchema.safeParse(body)

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

    const applicationData = validationResult.data

    // Check if user already has an application for this season
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        season: '2026',
      },
    })

    if (existingApplication) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'ALREADY_EXISTS' as ErrorCode,
              message: 'You already have an application for this season',
            },
          },
          { status: 409 }
        )
      )
    }

    // TODO: Add season settings check when SeasonSettings model is implemented
    // For now, applications are always open and unlimited

    // Get or create default form for this season
    let form = await prisma.applicationForm.findUnique({
      where: { season: '2026' },
    })

    if (!form) {
      // Create default form if it doesn't exist
      form = await prisma.applicationForm.create({
        data: {
          season: '2026',
          title: 'FIRST Global Challenge Kenya 2026 Application',
          description: 'Application form for FGC Kenya 2026 cohort',
          fields: {},
          isActive: true,
          openDate: new Date(),
          closeDate: new Date('2026-12-31'),
          createdById: user.id,
        },
      })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        season: '2026',
        status: 'DRAFT' as ApplicationStatus,
        formId: form.id,
        responses: {},
        ...applicationData,
      },
      include: {
        statusHistory: true,
      },
    })

    // TODO: Update season application count when SeasonSettings model is implemented

    // Create audit log
    await createAuditLog(
      'APPLICATION_CREATED',
      'Application',
      application.id,
      { season: '2026', status: 'DRAFT' },
      authenticatedRequest
    )

    const response = addSecurityHeaders(
      NextResponse.json({
        success: true,
        data: application as any,
        message: 'Application created successfully',
      })
    )

    return response
  } catch (error) {
    console.error('Create application error:', error)

    return addSecurityHeaders(
      NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR' as ErrorCode,
            message: 'Failed to create application',
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
