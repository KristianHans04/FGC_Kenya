import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// POST /api/admin/media - Create new article
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      excerpt,
      content,
      coverImage,
      tags = [],
      status = 'draft',
      scheduledPublishAt
    } = data

    // Validate required fields for publishing
    if (status === 'published' && (!title || !excerpt || !content || !coverImage)) {
      return NextResponse.json(
        { error: 'Title, excerpt, content, and cover image are required for publishing' },
        { status: 400 }
      )
    }

    // Calculate read time (average 200 words per minute)
    const plainText = content.replace(/<[^>]*>/g, '')
    const wordCount = plainText.split(/\s+/).filter((word: string) => word.length > 0).length
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`

    // Generate unique slug
    let slug = generateSlug(title || 'untitled')
    let slugExists = await prisma.mediaArticle.findUnique({ where: { slug } })
    let counter = 1
    
    while (slugExists) {
      slug = `${generateSlug(title || 'untitled')}-${counter}`
      slugExists = await prisma.mediaArticle.findUnique({ where: { slug } })
      counter++
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        cohortMemberships: { 
          where: { isActive: true },
          select: { cohort: true, isActive: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine article status based on user role
    let articleStatus = status
    if (user.role === 'STUDENT') {
      // Students' articles need approval
      articleStatus = status === 'published' ? 'PENDING_REVIEW' : 'DRAFT'
    } else if (status === 'published') {
      articleStatus = 'PUBLISHED'
    } else {
      articleStatus = 'DRAFT'
    }

    // Get cohort restriction if user is a student or mentor
    let cohortRestriction = null
    if (user.role === 'STUDENT' || user.role === 'MENTOR') {
      const activeMembership = user.cohortMemberships.find(m => m.isActive)
      if (activeMembership) {
        cohortRestriction = activeMembership.cohort
      }
    }

    const article = await prisma.mediaArticle.create({
      data: {
        slug,
        title: title || 'Untitled',
        excerpt: excerpt || '',
        content: content || '',
        coverImage,
        tags,
        status: articleStatus,
        // Status already determines if it's a draft
        authorId: user.id,
        publishedAt: articleStatus === 'PUBLISHED' ? new Date() : null,
        viewCount: 0
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_CREATED',
        entityType: 'MediaArticle',
        entityId: article.id,
        userId: user.id,
        details: {
          title: title || 'Untitled',
          status: articleStatus
        }
      }
    })

    return NextResponse.json({
      success: true,
      article
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}