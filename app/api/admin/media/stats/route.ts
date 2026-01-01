import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

// GET /api/admin/media/stats - Get media statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email },
      include: { 
        cohortMemberships: { where: { isActive: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let whereClause: any = {}

    // Role-based filtering for stats
    if (user.role === 'STUDENT') {
      whereClause.authorId = user.id
    } else if (user.role === 'MENTOR') {
      const mentorCohorts = user.cohortMemberships
        .filter(m => m.role === 'MENTOR')
        .map(m => m.cohort)
      
      if (mentorCohorts.length > 0) {
        whereClause.OR = [
          { authorId: user.id },
          { 
            AND: [
              { cohortRestriction: { in: mentorCohorts } },
              { author: { role: 'STUDENT' } }
            ]
          }
        ]
      } else {
        whereClause.authorId = user.id
      }
    }

    // Get counts for different statuses
    const [total, drafts, pending, published, approved, rejected] = await Promise.all([
      prisma.mediaArticle.count({ where: whereClause }),
      prisma.mediaArticle.count({ 
        where: { ...whereClause, status: 'DRAFT' } 
      }),
      prisma.mediaArticle.count({ 
        where: { ...whereClause, status: 'PENDING_REVIEW' } 
      }),
      prisma.mediaArticle.count({ 
        where: { ...whereClause, status: 'PUBLISHED' } 
      }),
      prisma.mediaArticle.count({ 
        where: { ...whereClause, status: 'APPROVED' } 
      }),
      prisma.mediaArticle.count({ 
        where: { ...whereClause, status: 'REJECTED' } 
      })
    ])

    return NextResponse.json({
      total,
      drafts,
      pending,
      published,
      approved,
      rejected
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}