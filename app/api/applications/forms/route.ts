import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/forms - Get all application forms
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can view forms
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const forms = await prisma.applicationForm.findMany({
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
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

    return NextResponse.json({
      success: true,
      data: {
        forms: forms.map(form => ({
          ...form,
          applicationCount: form._count.applications
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching application forms:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch application forms' } },
      { status: 500 }
    )
  }
}

// POST /api/applications/forms - Create new application form
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can create forms
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Check if season already exists
    if (data.season) {
      const existingForm = await prisma.applicationForm.findUnique({
        where: {
          season: data.season
        }
      })

      if (existingForm) {
        // If it's an autosave and the form is a draft, return the existing form
        if (data.isAutoSave && existingForm.isDraft) {
          // Update the existing draft instead of creating a new one
          const updatedForm = await prisma.applicationForm.update({
            where: { id: existingForm.id },
            data: {
              title: data.title || existingForm.title,
              description: data.description || existingForm.description,
              tabs: data.tabs || existingForm.tabs,
              themeColor: data.themeColor || existingForm.themeColor,
              accentColor: data.accentColor || existingForm.accentColor,
              lastAutoSave: new Date()
            },
            include: {
              createdBy: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          })
          
          return NextResponse.json({
            success: true,
            data: {
              form: updatedForm
            }
          })
        }
        
        // If manually saving and season exists
        if (!data.isAutoSave && !data.isDraft) {
          return NextResponse.json(
            { 
              error: { 
                message: `An application form for season ${data.season} already exists. Please use a different season identifier.`,
                code: 'SEASON_EXISTS',
                existingFormId: existingForm.id 
              } 
            },
            { status: 400 }
          )
        }
      }
    }

    // If making this form active, deactivate other forms
    if (data.isActive) {
      await prisma.applicationForm.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    const form = await prisma.applicationForm.create({
      data: {
        season: data.season,
        title: data.title,
        description: data.description,
        tabs: data.tabs,
        themeColor: data.themeColor || '#006600',
        accentColor: data.accentColor || '#008800',
        coverImage: data.coverImage,
        allowSaveDraft: data.allowSaveDraft,
        requireDocumentLinks: data.requireDocumentLinks,
        enableAutoFill: data.enableAutoFill,
        openDate: data.openDate ? new Date(data.openDate) : new Date(),
        closeDate: data.closeDate ? new Date(data.closeDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: data.isActive,
        isDraft: data.isDraft !== undefined ? data.isDraft : false,
        createdById: authResult.user?.id
      },
      include: {
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_CREATED',
        entityType: 'ApplicationForm',
        entityId: form.id,
        details: {
          season: form.season,
          title: form.title
        },
        userId: authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        form
      }
    })
  } catch (error) {
    console.error('Error creating application form:', error)
    return NextResponse.json(
      { error: { message: 'Failed to create application form' } },
      { status: 500 }
    )
  }
}