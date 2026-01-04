import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/forms/[formId] - Get single form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    const { formId } = await params
    const form = await prisma.applicationForm.findUnique({
      where: {
        id: formId
      },
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
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: { message: 'Form not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        form: {
          ...form,
          applicationCount: form._count.applications
        }
      }
    })
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch form' } },
      { status: 500 }
    )
  }
}

// PUT /api/applications/forms/[formId] - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only admins can update forms
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Check if form exists
    const { formId } = await params
    const existingForm = await prisma.applicationForm.findUnique({
      where: { id: formId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: { message: 'Form not found' } },
        { status: 404 }
      )
    }

    // Don't allow changes to forms with applications
    if (existingForm._count.applications > 0 && data.tabs) {
      return NextResponse.json(
        { error: { message: 'Cannot modify form structure after applications have been submitted' } },
        { status: 400 }
      )
    }

    // If making this form active, deactivate others
    if (data.isActive && !existingForm.isActive) {
      await prisma.applicationForm.updateMany({
        where: {
          isActive: true,
          id: { not: formId }
        },
        data: { isActive: false }
      })
    }

    // Update form
    const updatedForm = await prisma.applicationForm.update({
      where: { id: formId },
      data: {
        title: data.title,
        description: data.description,
        tabs: data.tabs,
        allowSaveDraft: data.allowSaveDraft,
        requireDocumentLinks: data.requireDocumentLinks,
        enableAutoFill: data.enableAutoFill,
        openDate: data.openDate ? new Date(data.openDate) : undefined,
        closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
        isActive: data.isActive
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
        action: 'APPLICATION_UPDATED',
        entityType: 'ApplicationForm',
        entityId: updatedForm.id,
        details: {
          season: updatedForm.season,
          title: updatedForm.title,
          changes: Object.keys(data)
        },
        userId: authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: { form: updatedForm }
    })
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json(
      { error: { message: 'Failed to update form' } },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/forms/[formId] - Delete form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401 }
      )
    }

    // Only super admins can delete forms
    if (authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Only super admins can delete forms' } },
        { status: 403 }
      )
    }

    // Check if form exists and has applications
    const { formId } = await params
    const existingForm = await prisma.applicationForm.findUnique({
      where: { id: formId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: { message: 'Form not found' } },
        { status: 404 }
      )
    }

    if (existingForm._count.applications > 0) {
      return NextResponse.json(
        { error: { message: 'Cannot delete form with existing applications' } },
        { status: 400 }
      )
    }

    // Delete the form
    await prisma.applicationForm.delete({
      where: { id: formId }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_WITHDRAWN',
        entityType: 'ApplicationForm',
        entityId: formId,
        details: {
          season: existingForm.season,
          title: existingForm.title
        },
        userId: authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Form deleted successfully' }
    })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json(
      { error: { message: 'Failed to delete form' } },
      { status: 500 }
    )
  }
}