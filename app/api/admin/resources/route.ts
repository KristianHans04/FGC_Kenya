import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'
import { z } from 'zod'

const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  link: z.string().url(),
  cohort: z.string().min(1)
})

// GET - Fetch learning resources
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cohort = searchParams.get('cohort')

    // Build query based on user role
    let whereClause: any = { isActive: true }

    if (authResult.user.role === 'MENTOR') {
      // Mentors can only see resources for their cohorts
      const mentorCohorts = await prisma.cohortMember.findMany({
        where: {
          userId: authResult.user.id,
          role: 'MENTOR'
        },
        select: { cohort: true }
      })
      
      const cohortNames = mentorCohorts.map(c => c.cohort)
      whereClause.cohort = { in: cohortNames }
    } else if (authResult.user.role === 'STUDENT') {
      // Students can only see resources for their cohorts
      const studentCohorts = await prisma.cohortMember.findMany({
        where: {
          userId: authResult.user.id,
          role: 'STUDENT'
        },
        select: { cohort: true }
      })
      
      const cohortNames = studentCohorts.map(c => c.cohort)
      whereClause.cohort = { in: cohortNames }
    }

    // Apply cohort filter if provided
    if (cohort) {
      whereClause.cohort = cohort
    }

    const resources = await prisma.learningResource.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: resources
    })
  } catch (error) {
    console.error('Fetch resources error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST - Create a new learning resource
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and mentors can create resources
    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validation = createResourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { title, description, link, cohort } = validation.data

    // Check if mentor has access to this cohort
    if (authResult.user.role === 'MENTOR') {
      const mentorCohort = await prisma.cohortMember.findFirst({
        where: {
          userId: authResult.user.id,
          cohort: cohort,
          role: 'MENTOR'
        }
      })

      if (!mentorCohort) {
        return NextResponse.json(
          { error: 'You do not have access to this cohort' },
          { status: 403 }
        )
      }
    }

    // Create the resource
    const resource = await prisma.learningResource.create({
      data: {
        title,
        description,
        link,
        cohort,
        createdById: authResult.user.id
      },
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

    // Send email notifications to cohort members
    const cohortMembers = await prisma.cohortMember.findMany({
      where: {
        cohort: cohort,
        isActive: true
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            notificationPreferences: {
              select: {
                emailEnabled: true,
                emailOnAnnouncement: true
              }
            }
          }
        }
      }
    })

    // Queue email notifications (we'll implement this later)
    const emailsToSend = cohortMembers
      .filter(m => 
        m.user.notificationPreferences?.emailEnabled && 
        m.user.notificationPreferences?.emailOnAnnouncement
      )
      .map(m => ({
        to: m.user.email,
        subject: `New Learning Resource: ${title}`,
        template: 'new-resource',
        data: {
          firstName: m.user.firstName || 'Team Member',
          resourceTitle: title,
          resourceDescription: description,
          cohort: cohort,
          link: link,
          createdBy: `${authResult.user.firstName} ${authResult.user.lastName}`
        }
      }))

    // TODO: Add to email queue
    if (emailsToSend.length > 0) {
      await prisma.emailQueue.createMany({
        data: emailsToSend.map(email => ({
          to: email.to,
          subject: email.subject,
          template: email.template,
          data: email.data
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: resource,
      message: 'Resource created successfully'
    })
  } catch (error) {
    console.error('Create resource error:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}