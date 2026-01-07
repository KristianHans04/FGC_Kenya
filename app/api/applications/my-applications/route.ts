import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/my-applications - Get current user's applications
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: authResult.user?.id
      },
      include: {
        form: {
          select: {
            id: true,
            season: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        applications: applications.map(app => ({
          id: app.id,
          formId: app.formId,
          status: app.status,
          season: app.form.season,
          title: app.form.title,
          description: app.form.description,
          createdAt: app.createdAt,
          submittedAt: app.submittedAt,
          reviewedAt: app.reviewedAt,
          updatedAt: app.updatedAt
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching user applications:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch applications' } },
      { status: 500 }
    )
  }
}