import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

// GET /api/applications/forms/active - Get the currently active form
export async function GET(request: NextRequest) {
  try {
    // Find the active form
    const activeForm = await prisma.applicationForm.findFirst({
      where: {
        isActive: true,
        isDraft: false,
        closeDate: {
          gte: new Date() // Still open (close date is in the future)
        }
      },
      select: {
        id: true,
        season: true,
        title: true,
        description: true,
        openDate: true,
        closeDate: true,
        tabs: true,
        themeColor: true,
        accentColor: true,
        coverImage: true,
        allowSaveDraft: true,
        requireDocumentLinks: true,
        enableAutoFill: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!activeForm) {
      return NextResponse.json({
        success: false,
        data: {
          form: null,
          message: 'No active application forms at the moment'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        form: {
          ...activeForm,
          applicationCount: activeForm._count.applications
        }
      }
    })
  } catch (error) {
    console.error('Error fetching active form:', error)
    return NextResponse.json(
      { 
        success: false,
        error: { 
          message: 'Failed to fetch active form' 
        } 
      },
      { status: 500 }
    )
  }
}