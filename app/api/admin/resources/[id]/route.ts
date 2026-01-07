import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'
import { z } from 'zod'

const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  link: z.string().url().optional(),
  cohort: z.string().min(1).optional()
})

// GET - Fetch single resource
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resource = await prisma.learningResource.findUnique({
      where: { id: params.id },
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

    // Check access permissions
    if (authResult.user.role === 'STUDENT') {
      const studentCohort = await prisma.cohortMember.findFirst({
        where: {
          userId: authResult.user.id,
          cohort: resource.cohort,
          role: 'STUDENT'
        }
      })
      
      if (!studentCohort) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (authResult.user.role === 'MENTOR') {
      const mentorCohort = await prisma.cohortMember.findFirst({
        where: {
          userId: authResult.user.id,
          cohort: resource.cohort,
          role: 'MENTOR'
        }
      })
      
      if (!mentorCohort) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Fetch resource error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

// PATCH - Update resource
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and mentors can update resources
    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validation = updateResourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const resource = await prisma.learningResource.findUnique({
      where: { id: params.id }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Check if mentor has access to this resource's cohort
    if (authResult.user.role === 'MENTOR') {
      const mentorCohort = await prisma.cohortMember.findFirst({
        where: {
          userId: authResult.user.id,
          cohort: resource.cohort,
          role: 'MENTOR'
        }
      })

      if (!mentorCohort) {
        return NextResponse.json(
          { error: 'You do not have access to this resource' },
          { status: 403 }
        )
      }

      // If changing cohort, check access to new cohort
      if (validation.data.cohort && validation.data.cohort !== resource.cohort) {
        const newCohortAccess = await prisma.cohortMember.findFirst({
          where: {
            userId: authResult.user.id,
            cohort: validation.data.cohort,
            role: 'MENTOR'
          }
        })

        if (!newCohortAccess) {
          return NextResponse.json(
            { error: 'You do not have access to the target cohort' },
            { status: 403 }
          )
        }
      }
    }

    // Update the resource
    const updatedResource = await prisma.learningResource.update({
      where: { id: params.id },
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

// DELETE - Delete resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      where: { id: params.id }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.learningResource.update({
      where: { id: params.id },
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