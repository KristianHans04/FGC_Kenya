import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/my-applications - Get user's applications
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
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
            closeDate: true
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
          season: app.form.season,
          title: app.form.title,
          status: app.status,
          progress: app.progress,
          submittedAt: app.submittedAt,
          createdAt: app.createdAt,
          closeDate: app.form.closeDate,
          canEdit: app.status === 'DRAFT' && new Date() < app.form.closeDate
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