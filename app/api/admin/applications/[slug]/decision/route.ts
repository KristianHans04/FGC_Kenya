import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import { sendApplicationDecisionEmail } from '@/app/lib/email/application-notifications'

// POST /api/admin/applications/[slug]/decision - Make final decision on application
export async function POST(
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

    // Only admins can make decisions
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const { slug } = await params
    const { status, score, reviewerFeedback, sendNotification } = await request.json()

    // Validate status
    const validStatuses = ['ACCEPTED', 'REJECTED', 'SHORTLISTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: { message: 'Invalid status' } },
        { status: 400 }
      )
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: slug },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        form: {
          select: {
            title: true,
            season: true
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

    // Update the application
    const updatedApplication = await prisma.application.update({
      where: { id: slug },
      data: {
        status,
        score: score || application.score,
        reviewerFeedback: reviewerFeedback || application.reviewerFeedback,
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
            county: true
          }
        },
        form: {
          select: {
            title: true,
            season: true
          }
        }
      }
    })

    // Send notification email if requested
    if (sendNotification) {
      try {
        await sendApplicationDecisionEmail({
          applicantEmail: application.user.email,
          applicantName: application.user.firstName 
            ? `${application.user.firstName} ${application.user.lastName || ''}`.trim()
            : 'Applicant',
          decision: status,
          formTitle: application.form.title,
          formYear: application.form.season,
          reviewerFeedback: reviewerFeedback || '',
          score: score
        })
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_STATUS_CHANGED',
        entityType: 'Application',
        entityId: slug,
        details: {
          decision: status,
          score,
          reviewedBy: authResult.user?.email,
          notificationSent: sendNotification
        },
        userId: authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: { application: updatedApplication }
    })
  } catch (error) {
    console.error('Error making application decision:', error)
    return NextResponse.json(
      { error: { message: 'Failed to make application decision' } },
      { status: 500 }
    )
  }
}