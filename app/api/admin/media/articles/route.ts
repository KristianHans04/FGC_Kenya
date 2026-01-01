import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

// GET /api/admin/media/articles - Get articles with filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const authorId = searchParams.get('authorId')
    const cohort = searchParams.get('cohort')
    const dateRange = searchParams.get('dateRange')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email },
      include: { 
        cohortMemberships: { where: { isActive: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause
    const where: any = {}

    // Role-based filtering
    if (user.role === 'STUDENT') {
      // Students can only see their own articles
      where.authorId = user.id
    } else if (user.role === 'MENTOR') {
      // Mentors can see their own articles and articles from students in their cohorts
      const mentorCohorts = user.cohortMemberships
        .filter(m => m.role === 'MENTOR')
        .map(m => m.cohort)
      
      if (mentorCohorts.length > 0) {
        where.OR = [
          { authorId: user.id },
          { 
            AND: [
              { cohortRestriction: { in: mentorCohorts } },
              { author: { role: 'STUDENT' } }
            ]
          }
        ]
      } else {
        where.authorId = user.id
      }
    }
    // Admins and super admins can see all articles

    // Apply filters
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (authorId && authorId !== 'all') {
      where.authorId = authorId
    }
    if (cohort && cohort !== 'all') {
      where.cohortRestriction = cohort
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } }
      ]
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      where.createdAt = { gte: startDate }
    }

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      prisma.mediaArticle.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          reviewedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mediaArticle.count({ where })
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}