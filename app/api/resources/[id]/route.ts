import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { z } from 'zod'
import { ResourceCategory } from '@prisma/client'

const UpdateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(ResourceCategory).optional(),
  fileUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  content: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resource = await prisma.teamResource.findUnique({
      where: { id: id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.teamResource.update({
      where: { id: id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resource = await prisma.teamResource.findUnique({
      where: { id: id },
      select: { uploadedById: true }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Only uploader or admin can update
    if (resource.uploadedById !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = UpdateResourceSchema.parse(body)

    // Only admins can pin resources
    if (validatedData.isPinned !== undefined && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      delete validatedData.isPinned
    }

    const updatedResource = await prisma.teamResource.update({
      where: { id: id },
      data: validatedData as any,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedResource
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.flatten() },
        { status: 400 }
      )
    }

    console.error('Error updating resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resource = await prisma.teamResource.findUnique({
      where: { id: id },
      select: { uploadedById: true }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Only uploader or admin can delete
    if (resource.uploadedById !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.teamResource.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}