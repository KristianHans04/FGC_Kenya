import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'
import { z } from 'zod'

const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  link: z.string().url().optional(),
  isActive: z.boolean().optional()
})

// GET - Get a single resource
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resource = await prisma.learningResource.findUnique({
      where: { slug: params.slug },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check access based on role
    if (authResult.user.role === 'STUDENT' || authResult.user.role === 'MENTOR') {
      const cohortMember = await prisma.cohortMember.findFirst({
        where: {
          userId: authResult.user.id,
          cohort: resource.cohort
        }
      })

      if (!cohortMember) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Get resource error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

// PATCH - Update a resource
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and the creator can update
    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resource = await prisma.learningResource.findUnique({
      where: { slug: params.slug }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check if user can update this resource
    if (authResult.user.role === 'MENTOR' && resource.createdById !== authResult.user.id) {
      return NextResponse.json(
        { error: 'You can only update resources you created' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = updateResourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const updatedResource = await prisma.learningResource.update({
      where: { slug: params.slug },
      data: validation.data,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedResource,
      message: 'Resource updated successfully'
    })
  } catch (error) {
    console.error('Update resource error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a resource
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete resources
    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const resource = await prisma.learningResource.findUnique({
      where: { slug: params.slug }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.learningResource.update({
      where: { slug: params.slug },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Delete resource error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}