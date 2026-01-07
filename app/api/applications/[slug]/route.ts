import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/applications/[slug] - Get specific application
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
    const application = await prisma.application.findUnique({
      where: {
        id: slug
      },
      include: {
        form: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
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

    // Check permissions
    const isOwner = application.userId === authResult.user?.id
    const isAdmin = authResult.user?.role === 'ADMIN' || authResult.user?.role === 'SUPER_ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { application }
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch application' } },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/[slug] - Delete draft application
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

    const { slug } = await params
    const application = await prisma.application.findUnique({
      where: {
        id: slug
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: { message: 'Application not found' } },
        { status: 404 }
      )
    }

    // Only owner can delete their own draft
    if (application.userId !== authResult.user?.id) {
      return NextResponse.json(
        { error: { message: 'You can only delete your own applications' } },
        { status: 403 }
      )
    }

    // Only draft applications can be deleted
    if (application.status !== 'DRAFT') {
      return NextResponse.json(
        { error: { message: 'Only draft applications can be deleted' } },
        { status: 400 }
      )
    }

    await prisma.application.delete({
      where: { id: slug }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_WITHDRAWN',
        entityType: 'Application',
        entityId: slug,
        userId: authResult.user?.id || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Application deleted successfully' }
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: { message: 'Failed to delete application' } },
      { status: 500 }
    )
  }
}