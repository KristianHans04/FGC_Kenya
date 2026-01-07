import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/admin/applications/calls/[slug] - Get specific application call
export async function GET(
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

    const { slug } = await params

    // Get the application form (call)
    const form = await prisma.applicationForm.findUnique({
      where: {
        id: slug
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: { message: 'Application call not found' } },
        { status: 404 }
      )
    }

    const call = {
      id: form.id,
      title: form.title,
      description: form.description,
      season: form.season,
      isActive: form.isActive,
      isDraft: form.isDraft,
      tabs: form.tabs,
      themeColor: form.themeColor,
      accentColor: form.accentColor,
      coverImage: form.coverImage,
      allowSaveDraft: form.allowSaveDraft,
      requireDocumentLinks: form.requireDocumentLinks,
      enableAutoFill: form.enableAutoFill,
      applicationCount: form._count.applications,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: { call }
    })
  } catch (error) {
    console.error('Error fetching application call:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch application call' } },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/applications/calls/[slug] - Delete application call
export async function DELETE(
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

    // Only admins can delete calls
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const { slug } = await params

    // Check if there are existing applications
    const applicationCount = await prisma.application.count({
      where: {
        formId: slug
      }
    })

    if (applicationCount > 0) {
      return NextResponse.json(
        { error: { message: 'Cannot delete call with existing applications' } },
        { status: 400 }
      )
    }

    // Delete the form
    await prisma.applicationForm.delete({
      where: {
        id: slug
      }
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Application call deleted successfully' }
    })
  } catch (error) {
    console.error('Error deleting application call:', error)
    return NextResponse.json(
      { error: { message: 'Failed to delete application call' } },
      { status: 500 }
    )
  }
}