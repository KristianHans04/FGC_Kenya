import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

// DELETE /api/admin/media/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const article = await prisma.mediaArticle.findUnique({
      where: { id }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check permissions
    const canDelete = 
      user.role === 'SUPER_ADMIN' ||
      user.role === 'ADMIN' ||
      (article.authorId === user.id && article.status === 'DRAFT')

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the article
    await prisma.mediaArticle.delete({
      where: { id: id }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_REJECTED', // Use existing action type
        entityType: 'MediaArticle',
        entityId: id,
        userId: user.id,
        details: {
          articleTitle: article.title,
          authorId: article.authorId,
          note: 'Article deleted'
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}