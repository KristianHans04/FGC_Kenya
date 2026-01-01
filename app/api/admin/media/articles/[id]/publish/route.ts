import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

// POST /api/admin/media/articles/[id]/publish
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and super admins can publish
    if (!['ADMIN', 'SUPER_ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const article = await prisma.mediaArticle.findUnique({
      where: { id: id }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if article is approved
    if (article.status !== 'APPROVED' && article.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Article must be approved before publishing' },
        { status: 400 }
      )
    }

    // Update article status to published
    const updatedArticle = await prisma.mediaArticle.update({
      where: { id: id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
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
        action: 'ARTICLE_PUBLISHED',
        entityType: 'MediaArticle',
        entityId: id,
        userId: user.id,
        adminId: user.id,
        details: {
          articleTitle: article.title,
          authorId: article.authorId
        }
      }
    })

    return NextResponse.json({
      success: true,
      article: updatedArticle
    })
  } catch (error) {
    console.error('Error publishing article:', error)
    return NextResponse.json(
      { error: 'Failed to publish article' },
      { status: 500 }
    )
  }
}