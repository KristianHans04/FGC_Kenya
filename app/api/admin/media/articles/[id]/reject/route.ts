import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/app/lib/middleware/auth'
import prisma from '@/app/lib/prisma'

// POST /api/admin/media/articles/[id]/reject
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

    // Only admins, super admins, and mentors can reject
    if (!['ADMIN', 'SUPER_ADMIN', 'MENTOR'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { reviewNotes } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: authResult.user.email },
      include: { cohortMemberships: { where: { isActive: true } } }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const article = await prisma.mediaArticle.findUnique({
      where: { id: id },
      include: { author: true }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if mentor has permission (must be from same cohort)
    if (user.role === 'MENTOR') {
      const mentorCohorts = user.cohortMemberships
        .filter(m => m.role === 'MENTOR')
        .map(m => m.cohort)
      
      if (!article.cohortRestriction || !mentorCohorts.includes(article.cohortRestriction)) {
        return NextResponse.json({ error: 'Forbidden - Not in same cohort' }, { status: 403 })
      }
    }

    // Update article status
    const updatedArticle = await prisma.mediaArticle.update({
      where: { id: id },
      data: {
        status: 'REJECTED',
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'Article rejected - Please review feedback and resubmit'
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
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_REJECTED',
        entityType: 'MediaArticle',
        entityId: id,
        userId: user.id,
        adminId: user.id,
        details: {
          articleTitle: article.title,
          authorId: article.authorId,
          reviewNotes
        }
      }
    })

    return NextResponse.json({
      success: true,
      article: updatedArticle
    })
  } catch (error) {
    console.error('Error rejecting article:', error)
    return NextResponse.json(
      { error: 'Failed to reject article' },
      { status: 500 }
    )
  }
}