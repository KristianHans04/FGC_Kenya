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

    // Check if user is admin
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)
    
    if (!isAdmin) {
      // For non-admins, check their cohort memberships
      const userCohorts = await prisma.cohortMember.findMany({
        where: {
          userId: authResult.user.id
        },
        select: { cohort: true }
      })
      
      if (userCohorts.length > 0) {
        const cohortNames = userCohorts.map(c => c.cohort)
        whereClause.cohort = { in: cohortNames }
      } else {
        // User has no cohorts, return empty
        whereClause.cohort = { in: [] }
      }
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

    // Check if user can create resources
    // Since UserRole enum doesn't include MENTOR, we need to check differently
    // For now, only admins can create through this endpoint
    // Mentors should be given access through a different mechanism
    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      // Check if user is a mentor for any cohort
      const isMentor = await prisma.cohortMember.findFirst({
        where: {
          userId: authResult.user.id,
          role: 'MENTOR'
        }
      })
      
      if (!isMentor) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await req.json()
    const validation = createResourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { title, description, link, cohort } = validation.data

    // Check if non-admin has access to this cohort
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)
    if (!isAdmin) {
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

    // Get creator's full details for email
    const creator = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: { firstName: true, lastName: true }
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
          createdBy: creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown'
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