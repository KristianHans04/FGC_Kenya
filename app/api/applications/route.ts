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
        data: applications,
      } as ApiResponse<Application[]>)
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

    // Check season settings to ensure applications are open
    const seasonSettings = await prisma.seasonSettings.findUnique({
      where: { season: '2026' },
    })

    const now = new Date()
    if (!seasonSettings?.isActive ||
        now < seasonSettings.applicationOpenDate ||
        now > seasonSettings.applicationCloseDate) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'APPLICATION_CLOSED' as ErrorCode,
              message: 'Applications are not currently open',
            },
          },
          { status: 403 }
        )
      )
    }

    // Check application limit
    if (seasonSettings.currentApplications >= seasonSettings.maxApplications) {
      return addSecurityHeaders(
        NextResponse.json(
          {
            success: false,
            error: {
              code: 'APPLICATIONS_FULL' as ErrorCode,
              message: 'Application limit reached for this season',
            },
          },
          { status: 403 }
        )
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        season: '2026',
        status: 'DRAFT' as ApplicationStatus,
        ...applicationData,
      },
      include: {
        statusHistory: true,
      },
    })

    // Update season application count
    await prisma.seasonSettings.update({
      where: { season: '2026' },
      data: { currentApplications: { increment: 1 } },
    })

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
        data: application,
        message: 'Application created successfully',
      } as ApiResponse<Application>)
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
