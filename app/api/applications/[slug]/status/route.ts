import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// PUT /api/applications/[slug]/status - Update application status
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

    // Only admins can update application status
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { status, reviewNotes } = data

    // Validate status
    const validStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: { message: 'Invalid status' } },
        { status: 400 }
      )
    }

    // Check if application exists
    const { slug } = await params
    const application = await prisma.application.findUnique({
      where: { id: slug },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: { message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id: slug },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: authResult.user?.id
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_STATUS_CHANGED',
        entityType: 'Application',
        entityId: slug,
        details: {
          previousStatus: application.status,
          newStatus: status,
          reviewNotes
        },
        userId: authResult.user?.id
      }
    })

    // TODO: Send notification email to applicant
    if (status !== 'DRAFT' && status !== 'UNDER_REVIEW') {
      console.log(`Send ${status} notification to ${application.user.email}`)
    }

    return NextResponse.json({
      success: true,
      data: { application: updatedApplication }
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update application status' } },
      { status: 500 }
    )
  }
}