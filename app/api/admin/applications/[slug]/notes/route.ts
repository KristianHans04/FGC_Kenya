import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest } from '@/app/lib/middleware/auth'

// GET /api/admin/applications/[slug]/notes - Get review notes
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

    // Only admins can view notes
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const { slug } = await params

    const notes = await prisma.applicationNote.findMany({
      where: { applicationId: slug },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: { notes }
    })
  } catch (error) {
    console.error('Error fetching application notes:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch application notes' } },
      { status: 500 }
    )
  }
}

// POST /api/admin/applications/[slug]/notes - Add review note
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

    // Only admins can add notes
    if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    const { slug } = await params
    const { content, isPrivate } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: { message: 'Note content is required' } },
        { status: 400 }
      )
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: slug }
    })

    if (!application) {
      return NextResponse.json(
        { error: { message: 'Application not found' } },
        { status: 404 }
      )
    }

    const note = await prisma.applicationNote.create({
      data: {
        content: content.trim(),
        isPrivate: isPrivate ?? true,
        applicationId: slug,
        createdById: authResult.user?.id
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'APPLICATION_UPDATED',
        entityType: 'Application',
        entityId: slug,
        details: {
          noteId: note.id,
          isPrivate: note.isPrivate,
          createdBy: authResult.user?.email
        },
        userId: authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: { note }
    })
  } catch (error) {
    console.error('Error adding application note:', error)
    return NextResponse.json(
      { error: { message: 'Failed to add application note' } },
      { status: 500 }
    )
  }
}