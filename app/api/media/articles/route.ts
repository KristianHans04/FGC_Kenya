/**
 * @file app/api/media/articles/route.ts
 * @description Media articles API with role-based access and semantic search
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest, createAuditLog } from '@/app/lib/middleware/auth'
import { rateLimit } from '@/app/lib/middleware/security'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

/**
 * GET /api/media/articles
 * Get articles with role-based filtering
 * Public: Only published articles
 * Student: Own articles + published articles
 * Mentor: Own articles + mentee articles (cohort-specific) + published articles
 * Admin/Super Admin: All articles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const semantic = searchParams.get('semantic') === 'true'
    const authorId = searchParams.get('authorId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Try to get authenticated user (optional for public access)
    let user
    try {
      const authResult = await authenticateRequest(request)
      if (authResult.success && authResult.user) {
        user = authResult.user
      }
    } catch {
      // No auth - public access
    }

    const where: any = {}

    // Role-based filtering
    if (!user) {
      // Public: Only published articles
      where.status = 'PUBLISHED'
    } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      // Admins see everything unless status filter is applied
      if (status) {
        where.status = status.toUpperCase()
      }
    } else if ((user.role as any) === 'MENTOR') {
      // Mentors see: own articles + mentee articles (their cohort) + published
      const cohortMemberships = await prisma.cohortMember.findMany({
        where: { userId: user.id, role: 'MENTOR', isActive: true },
        select: { cohort: true }
      })
      const mentorCohorts = cohortMemberships.map(cm => cm.cohort)

      // Get students from mentor's cohorts
      const cohortStudents = await prisma.cohortMember.findMany({
        where: {
          cohort: { in: mentorCohorts },
          role: 'STUDENT',
          isActive: true
        },
        select: { userId: true }
      })
      const studentIds = cohortStudents.map(cs => cs.userId)

      where.OR = [
        { authorId: user.id }, // Own articles
        { authorId: { in: studentIds }, cohortRestriction: { in: mentorCohorts } }, // Mentee articles
        { status: 'PUBLISHED' } // Published articles
      ]
    } else if ((user.role as any) === 'STUDENT') {
      // Students see: own articles + published articles
      where.OR = [
        { authorId: user.id },
        { status: 'PUBLISHED' }
      ]
    } else {
      // Default: published only
      where.status = 'PUBLISHED'
    }

    // Additional filters
    if (tag && tag !== 'all') {
      where.tags = { has: tag }
    }

    if (authorId) {
      where.authorId = authorId
    }

    // Search functionality
    if (search) {
      if (semantic) {
        // Semantic search - searches across title, excerpt, and content
        where.OR = [
          ...(where.OR || []),
          { title: { search: search } },
          { excerpt: { search: search } },
          { content: { search: search } }
        ]
      } else {
        // Keyword search
        where.OR = [
          ...(where.OR || []),
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { has: search.toLowerCase() } }
        ]
      }
    }

    const [articles, total] = await Promise.all([
      prisma.mediaArticle.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          status: true,
          viewCount: true,
          publishedAt: true,
          featuredAt: true,
          createdAt: true,
          updatedAt: true,
          cohortRestriction: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          reviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          reviewedAt: true,
          reviewNotes: true
        },
        orderBy: status === 'PUBLISHED' ? { publishedAt: 'desc' } : { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.mediaArticle.count({ where })
    ])

    return NextResponse.json({
      success: true,
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
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/media/articles
 * Create a new article (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, 'api')
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Authentication required
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = authResult.user
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + `-${Date.now()}`

    // Determine initial status based on role
    let initialStatus = body.status || 'DRAFT'
    if (initialStatus === 'PUBLISHED' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      // Students and mentors can't publish directly
      initialStatus = 'PENDING_REVIEW'
    }

    // Get cohort restriction for students
    let cohortRestriction = null
    if ((user.role as any) === 'STUDENT') {
      const cohortMemberships = await prisma.cohortMember.findFirst({
        where: { userId: user.id, role: 'STUDENT', isActive: true },
        select: { cohort: true }
      })
      cohortRestriction = cohortMemberships?.cohort || null
    }

    const article = await prisma.mediaArticle.create({
      data: {
        slug,
        title: body.title,
        excerpt: body.excerpt || '',
        content: body.content,
        coverImage: body.coverImage,
        tags: body.tags || [],
        status: initialStatus,
        authorId: user.id,
        cohortRestriction,
        publishedAt: initialStatus === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
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

    // Audit log
    await createAuditLog(
      'CREATE',
      'MediaArticle',
      article.id,
      { title: article.title, status: initialStatus },
      request as AuthenticatedRequest
    )

    return NextResponse.json({
      success: true,
      article
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    )
  }
}