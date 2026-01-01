'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Eye,
  Share2,
  ArrowLeft,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  author: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    role: string
  }
  tags: string[]
  viewCount: number
  publishedAt: string
  readTime?: number
  metaTitle?: string
  metaDescription?: string
}

interface RelatedArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage?: string
  author: {
    firstName?: string
    lastName?: string
    email: string
  }
  publishedAt: string
  viewCount: number
  readTime?: number
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewTracked, setViewTracked] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const fetchArticle = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/media/articles/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data.article)
        setRelatedArticles(data.related || [])

        // Update page meta tags
        if (data.article) {
          document.title = `${data.article.metaTitle || data.article.title} | FIRST Global Team Kenya`
          const metaDescription = document.querySelector('meta[name="description"]')
          if (metaDescription) {
            metaDescription.setAttribute('content', data.article.metaDescription || data.article.excerpt)
          } else {
            const meta = document.createElement('meta')
            meta.name = 'description'
            meta.content = data.article.metaDescription || data.article.excerpt
            document.head.appendChild(meta)
          }
        }

        // Track page view
        if (!viewTracked) {
          trackPageView()
        }
      } else if (response.status === 404) {
        router.push('/404')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }

  const trackPageView = async () => {
    try {
      await fetch(`/api/media/articles/${slug}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })
      setViewTracked(true)
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const shareArticle = (platform: string) => {
    if (!article) return

    const url = window.location.href
    const title = article.title
    const text = article.excerpt

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-8"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/media"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <article className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/media"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{article.excerpt}</p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-6 border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  By <span className="font-medium text-foreground">
                    {article.author.firstName ? 
                      `${article.author.firstName} ${article.author.lastName || ''}` : 
                      article.author.email.split('@')[0]
                    }
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </div>
              {article.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime} min read
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.viewCount + (viewTracked ? 1 : 0)} views
              </div>
            </div>
          </motion.header>

          {/* Cover Image */}
          {article.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 rounded-xl overflow-hidden"
            >
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-auto"
              />
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none dark:prose-invert mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-2 mb-8"
            >
              <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/media?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>
          )}

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-t pt-8 mb-12"
          >
            <h3 className="text-lg font-semibold mb-4">Share this article</h3>
            <div className="flex gap-2">
              <button
                onClick={() => shareArticle('facebook')}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => shareArticle('twitter')}
                className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => shareArticle('linkedin')}
                className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button
                onClick={() => shareArticle('copy')}
                className="p-3 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                title="Copy link"
              >
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                {copied && <span className="text-sm">Copied!</span>}
              </button>
            </div>
          </motion.div>

          {/* Author Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-12"
          >
            <h3 className="text-lg font-semibold mb-2">About the Author</h3>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">
                  {article.author.firstName ? 
                    `${article.author.firstName} ${article.author.lastName || ''}` : 
                    article.author.email.split('@')[0]
                  }
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {article.author.role.toLowerCase().replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Contributing writer and member of the FIRST Global Team Kenya community.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/media/${related.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all group"
                  >
                    {related.coverImage ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={related.coverImage}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <ChevronRight className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {related.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(related.publishedAt)}</span>
                        {related.readTime && (
                          <span>{related.readTime} min read</span>
                        )}
                        <span>{related.viewCount} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>
    </div>
  )
}