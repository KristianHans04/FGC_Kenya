import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// POST /api/admin/media/draft - Save draft
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, title, excerpt, content, coverImage, tags = [] } = data

    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate read time
    const plainText = (content || '').replace(/<[^>]*>/g, '')
    const wordCount = plainText.split(/\s+/).filter((word: string) => word.length > 0).length
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`

    let article

    if (id) {
      // Update existing draft
      const existing = await prisma.mediaArticle.findUnique({
        where: { id }
      })

      if (!existing) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      // Check permissions
      if (user.role === 'STUDENT' && existing.authorId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      article = await prisma.mediaArticle.update({
        where: { id },
        data: {
          title: title || existing.title,
          excerpt: excerpt || existing.excerpt,
          content: content || existing.content,
          coverImage: coverImage || existing.coverImage,
          tags,
          status: 'DRAFT'
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
    } else {
      // Create new draft
      let slug = generateSlug(title || 'draft')
      let slugExists = await prisma.mediaArticle.findUnique({ where: { slug } })
      let counter = 1
      
      while (slugExists) {
        slug = `${generateSlug(title || 'draft')}-${counter}`
        slugExists = await prisma.mediaArticle.findUnique({ where: { slug } })
        counter++
      }

      article = await prisma.mediaArticle.create({
        data: {
          slug,
          title: title || 'Untitled Draft',
          excerpt: excerpt || '',
          content: content || '',
          coverImage,
          tags,
          status: 'DRAFT',
          authorId: user.id,
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
    }

    return NextResponse.json({
      success: true,
      article,
      message: 'Draft saved successfully'
    })
  } catch (error) {
    console.error('Error saving draft:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// GET /api/admin/media/draft - Get user's drafts
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const drafts = await prisma.mediaArticle.findMany({
      where: {
        authorId: user.id,
        status: 'DRAFT'
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
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      drafts
    })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
}