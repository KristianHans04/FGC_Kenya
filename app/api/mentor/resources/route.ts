import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get mentor's active cohort
    const mentorCohort = await prisma.cohortMember.findFirst({
      where: {
        userId: authResult.user.id,
        role: 'MENTOR',
        isActive: true
      },
      select: {
        cohort: true
      }
    })

    if (!mentorCohort) {
      return NextResponse.json({ 
        success: true, 
        data: { resources: [] },
        message: 'No active mentor cohort found'
      })
    }

    // Fetch learning resources for this cohort or created by this mentor
    const resources = await prisma.learningResource.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { cohort: mentorCohort.cohort },
              { createdById: authResult.user.id }
            ]
          }
        ]
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format resources for display
    const formattedResources = resources.map(resource => {
      // Determine resource type based on link
      let type = 'document'
      const url = resource.link.toLowerCase()
      if (url.includes('youtube') || url.includes('video') || url.includes('vimeo')) {
        type = 'video'
      } else if (url.endsWith('.ppt') || url.endsWith('.pptx')) {
        type = 'presentation'
      } else if (url.includes('exercise') || url.includes('practice')) {
        type = 'exercise'
      }

      return {
        id: resource.id,
        slug: resource.slug,
        title: resource.title,
        description: resource.description || '',
        type,
        category: 'Learning Materials',
        fileUrl: resource.link,
        fileSize: 'N/A',
        uploadedAt: resource.createdAt.toISOString(),
        lastModified: resource.updatedAt.toISOString(),
        downloads: 0,
        assignedCohorts: [resource.cohort],
        tags: [],
        createdBy: resource.createdBy ? 
          `${resource.createdBy.firstName} ${resource.createdBy.lastName}` : 
          'Unknown',
        isOwner: resource.createdById === authResult.user?.id
      }
    })

    return NextResponse.json({
      success: true,
      data: { 
        resources: formattedResources,
        cohort: mentorCohort.cohort
      }
    })
  } catch (error) {
    console.error('Fetch mentor resources error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}
