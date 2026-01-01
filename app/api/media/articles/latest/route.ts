import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

// GET /api/media/articles/latest - Get latest published articles
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')

    const articles = await prisma.mediaArticle.findMany({
      where: {
        status: 'PUBLISHED'
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc'
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        viewCount: true,
        publishedAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    // Calculate read time for each article
    const articlesWithReadTime = articles.map(article => ({
      ...article,
      readTime: Math.ceil((article.excerpt || '').split(' ').length / 200) || 1
    }))

    return NextResponse.json({ articles: articlesWithReadTime })
  } catch (error) {
    console.error('Error fetching latest articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest articles' },
      { status: 500 }
    )
  }
}