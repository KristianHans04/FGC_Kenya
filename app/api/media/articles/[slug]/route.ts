/**
 * @file app/api/media/articles/[slug]/route.ts
 * @description Single article operations with role-based access
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authenticateRequest, createAuditLog } from '@/app/lib/middleware/auth'
import type { AuthenticatedRequest } from '@/app/lib/middleware/auth'

// GET /api/media/articles/[slug] - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const article = await prisma.mediaArticle.findUnique({
      where: { slug },
      include: {
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
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    let hasAccess = article.status === 'PUBLISHED'

    if (!hasAccess) {
      try {
        const authResult = await authenticateRequest(request)
        if (authResult && authResult.success && authResult.user) {
          const user = authResult.user

          if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
            hasAccess = true
          } else if (user.id === article.authorId) {
            hasAccess = true
          } else if ((user.role as any) === 'MENTOR') {
            const mentorCohorts = await prisma.cohortMember.findMany({
              where: { userId: user.id, role: 'MENTOR', isActive: true },
              select: { cohort: true }
            })
            const cohorts = mentorCohorts.map(cm => cm.cohort)

            const authorCohort = await prisma.cohortMember.findFirst({
              where: {
                userId: article.authorId,
                cohort: { in: cohorts },
                role: 'STUDENT',
                isActive: true
              }
            })

            hasAccess = !!authorCohort
          }
        }
      } catch {
        // Not authenticated
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get related articles
    const related = await prisma.mediaArticle.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
        OR: [
          { tags: { hasSome: article.tags } },
          { authorId: article.authorId }
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        viewCount: true,
        tags: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 4
    })

    return NextResponse.json({
      success: true,
      article,
      related
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PATCH /api/media/articles/[slug] - Update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = authResult.user
    const body = await request.json()

    const article = await prisma.mediaArticle.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isAuthor = article.authorId === user.id
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isMentor = (user.role as any) === 'MENTOR'

    if (!isAuthor && !isAdmin && !isMentor) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    // If mentor, verify they can access this article
    if (isMentor && !isAdmin) {
      const mentorCohorts = await prisma.cohortMember.findMany({
        where: { userId: user.id, role: 'MENTOR', isActive: true },
        select: { cohort: true }
      })
      const cohorts = mentorCohorts.map(cm => cm.cohort)

      const authorCohort = await prisma.cohortMember.findFirst({
        where: {
          userId: article.authorId,
          cohort: { in: cohorts },
          role: 'STUDENT',
          isActive: true
        }
      })

      if (!authorCohort) {
        return NextResponse.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (body.title) updateData.title = body.title
    if (body.excerpt) updateData.excerpt = body.excerpt
    if (body.content) updateData.content = body.content
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
    if (body.tags) updateData.tags = body.tags

    // Handle status updates
    if (body.status) {
      const newStatus = body.status.toUpperCase()

      // Only admins can publish directly
      if (newStatus === 'PUBLISHED' && !isAdmin) {
        updateData.status = 'PENDING_REVIEW'
      } else {
        updateData.status = newStatus
      }

      // Set publishedAt when publishing
      if (updateData.status === 'PUBLISHED' && !article.publishedAt) {
        updateData.publishedAt = new Date()
      }

      // Add review info if approving/rejecting
      if ((newStatus === 'APPROVED' || newStatus === 'REJECTED' || newStatus === 'PUBLISHED') && (isAdmin || isMentor)) {
        updateData.reviewedById = user.id
        updateData.reviewedAt = new Date()
        if (body.reviewNotes) {
          updateData.reviewNotes = body.reviewNotes
        }
      }
    }

    const updatedArticle = await prisma.mediaArticle.update({
      where: { slug },
      data: updateData,
      include: {
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
        }
      }
    })

    await createAuditLog(
      'UPDATE',
      'MediaArticle',
      article.id,
      { changes: updateData },
      request as AuthenticatedRequest
    )

    return NextResponse.json({
      success: true,
      article: updatedArticle
    })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/articles/[slug] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const authResult = await authenticateRequest(request)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = authResult.user
    const article = await prisma.mediaArticle.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    const isAuthor = article.authorId === user.id
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    await prisma.mediaArticle.delete({
      where: { slug }
    })

    await createAuditLog(
      'DELETE',
      'MediaArticle',
      article.id,
      { title: article.title },
      request as AuthenticatedRequest
    )

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}