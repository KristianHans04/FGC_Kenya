import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// PUT /api/admin/applications/[slug]/review - Update application review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can review applications
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const { slug } = await params
    const data = await request.json()

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: slug },
      include: {
        user: true,
        form: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: { message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id: slug },
      data: {
        status: data.status || application.status,
        score: data.score,
        reviewerFeedback: data.reviewerFeedback,
        reviewedAt: new Date(),
        reviewedBy: authResult.user?.id
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            school: true,
            county: true,
            dateOfBirth: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_REVIEWED',
        entityType: 'Application',
        entityId: slug,
        details: {
          status: updatedApplication.status,
          score: updatedApplication.score,
          reviewedBy: authResult.user?.email
        },
        userId: authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: { application: updatedApplication }
    })
  } catch (error) {
    console.error('Error updating application review:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update application review' } },
      { status: 500 }
    )
  }
}