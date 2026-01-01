import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

// POST /api/media/articles/[slug]/view - Track page view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const { sessionId, userAgent, referrer } = await request.json()

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Find the article
    const article = await prisma.mediaArticle.findFirst({
      where: {
        slug,
        status: 'PUBLISHED'
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // For now, simply increment the view count
    // In production, you'd want to track unique views per session
    await prisma.mediaArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    })

    // View tracking is handled by viewCount increment
    // Additional analytics can be added with a separate analytics service

    return NextResponse.json({
      success: true,
      tracked: true
    })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}