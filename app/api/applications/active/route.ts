import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/active - Get active application form for students
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Get the currently active form
    const activeForm = await prisma.applicationForm.findFirst({
      where: {
        isActive: true,
        openDate: {
          lte: new Date()
        },
        closeDate: {
          gte: new Date()
        }
      }
    })

    if (!activeForm) {
      return NextResponse.json({
        success: true,
        data: { form: null, message: 'No active application form available' }
      })
    }

    // Check if user has already submitted an application
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: authResult.user?.id,
        formId: activeForm.id
      },
      select: {
        id: true,
        status: true,
        submittedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        form: activeForm,
        existingApplication,
        canApply: !existingApplication || existingApplication.status === 'DRAFT'
      }
    })
  } catch (error) {
    console.error('Error fetching active form:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch active form' } },
      { status: 500 }
    )
  }
}