'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, Eye, ArrowRight, Loader2 } from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage?: string
  tags: string[]
  viewCount: number
  publishedAt: string
  readTime: number
  author: {
    firstName: string
    lastName: string
    role: string
  }
}

export default function LatestStories() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestArticles()
  }, [])

  const fetchLatestArticles = async () => {
    try {
      const response = await fetch('/api/media/articles/latest?limit=6')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Failed to fetch latest articles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-6 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Stories</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover inspiring stories, insights, and updates from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              {article.coverImage && (
                <Link href={`/media/${article.slug}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {index === 0 && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                </Link>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author.firstName} {article.author.lastName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-xl mb-2 line-clamp-2">
                  <Link 
                    href={`/media/${article.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>

                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-muted text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount}
                    </span>
                  </div>
                  
                  <Link
                    href={`/media/${article.slug}`}
                    className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/media"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All Stories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}