import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// POST /api/applications/submit - Submit or save draft application
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { formId, responses, isDraft = false } = data

    // Verify form exists and is active
    const form = await prisma.applicationForm.findUnique({
      where: { id: formId }
    })

    if (!form) {
      return NextResponse.json(
        { error: { message: 'Form not found' } },
        { status: 404 }
      )
    }

    if (!form.isActive) {
      return NextResponse.json(
        { error: { message: 'This form is no longer accepting applications' } },
        { status: 400 }
      )
    }

    // Check if application period is valid
    const now = new Date()
    if (now < form.openDate || now > form.closeDate) {
      return NextResponse.json(
        { error: { message: 'Application period has closed' } },
        { status: 400 }
      )
    }

    // Check for existing application
    let application = await prisma.application.findFirst({
      where: {
        userId: authResult.user?.id,
        formId: formId
      }
    })

    if (application) {
      // Update existing application
      if (application.status === 'SUBMITTED') {
        return NextResponse.json(
          { error: { message: 'Application has already been submitted and cannot be modified' } },
          { status: 400 }
        )
      }

      application = await prisma.application.update({
        where: { id: application.id },
        data: {
          responses,
          status: isDraft ? 'DRAFT' : 'SUBMITTED',
          submittedAt: isDraft ? null : new Date(),
          progress: calculateProgress(responses, form.tabs as any)
        }
      })
    } else {
      // Create new application
      application = await prisma.application.create({
        data: {
          userId: authResult.user?.id || '',
          formId,
          season: form.season,
          email: authResult.user?.email || '',
          responses,
          status: isDraft ? 'DRAFT' : 'SUBMITTED',
          submittedAt: isDraft ? null : new Date(),
          progress: calculateProgress(responses, form.tabs as any)
        }
      })
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: isDraft ? 'APPLICATION_UPDATED' : 'APPLICATION_SUBMITTED',
        entityType: 'Application',
        entityId: application.id,
        details: {
          formId,
          season: form.season
        },
        userId: authResult.user?.id
      }
    })

    // Send confirmation email if submitted (not draft)
    if (!isDraft) {
      // TODO: Implement email notification
      console.log('Send confirmation email to user')
    }

    return NextResponse.json({
      success: true,
      data: {
        application,
        message: isDraft ? 'Application saved as draft' : 'Application submitted successfully'
      }
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: { message: 'Failed to submit application' } },
      { status: 500 }
    )
  }
}

// Helper function to calculate progress
function calculateProgress(responses: any, tabs: any[]): number {
  if (!tabs || tabs.length === 0) return 0

  let totalFields = 0
  let completedFields = 0

  tabs.forEach(tab => {
    if (tab.fields && Array.isArray(tab.fields)) {
      tab.fields.forEach((field: any) => {
        if (field.required) {
          totalFields++
          if (responses[field.id] && responses[field.id] !== '') {
            completedFields++
          }
        }
      })
    }
  })

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
}