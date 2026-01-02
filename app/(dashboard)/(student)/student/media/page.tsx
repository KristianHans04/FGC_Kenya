/**
 * @file app/(dashboard)/(student)/student/media/page.tsx
 * @description Student media management - create and edit own articles
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Trash2,
  Search
} from 'lucide-react'
import MediaEditorV2 from '@/app/components/media/MediaEditorV2'
import { cn } from '@/app/lib/utils/cn'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'
  tags: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
  reviewNotes?: string
}

export default function StudentMediaPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    document.title = 'My Articles | Student Dashboard'
  }, [])

  useEffect(() => {
    if (view === 'list') {
      fetchArticles()
    }
  }, [view])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media/articles')
      if (response.ok) {
        const data = await response.json()
        // Filter to only show own articles
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveArticle = async (data: any, isDraft: boolean) => {
    try {
      const url = selectedArticle
        ? `/api/media/articles/${selectedArticle.slug}`
        : '/api/media/articles'

      const method = selectedArticle ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setView('list')
        setSelectedArticle(null)
        fetchArticles()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save article')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Failed to save article')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any; text: string }> = {
      DRAFT: { class: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Draft' },
      PENDING_REVIEW: { class: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Under Review' },
      APPROVED: { class: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      PUBLISHED: { class: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Published' },
      REJECTED: { class: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
    }

    const badge = badges[status] || badges.DRAFT
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Editor View
  if (view === 'create' || view === 'edit') {
    return (
      <div className="p-6">
        <MediaEditorV2
          article={selectedArticle ? {
            id: selectedArticle.id,
            title: selectedArticle.title,
            excerpt: selectedArticle.excerpt,
            content: selectedArticle.content,
            coverImage: selectedArticle.coverImage,
            tags: selectedArticle.tags,
            status: selectedArticle.status as 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED'
          } : undefined}
          onSave={handleSaveArticle}
          onClose={() => {
            setView('list')
            setSelectedArticle(null)
          }}
          userRole="STUDENT"
        />
      </div>
    )
  }

  // List View
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Articles</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your articles. All articles require approval before publishing.
          </p>
        </div>
        <button
          onClick={() => setView('create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Article
        </button>
      </div>

      {/* Info Alert */}
      <div className="card bg-blue-50 border-blue-200 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900">
            <strong>Article Review Process:</strong> After you submit an article for review, it will be reviewed and once approved, it will be published and visible to everyone on the public platform pages.
          </p>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
          <p className="text-muted-foreground mb-4">
            Start sharing your knowledge and experiences by creating your first article
          </p>
          <button onClick={() => setView('create')} className="btn-primary">
            Create Your First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 space-y-4"
            >
              {article.coverImage && (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xl font-semibold line-clamp-2 flex-1">
                    {article.title}
                  </h3>
                  {getStatusBadge(article.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(article.updatedAt)}
                </span>
                {article.status === 'PUBLISHED' && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount} views
                  </span>
                )}
              </div>

              {article.reviewNotes && article.status === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-900 mb-1">Reviewer Feedback:</p>
                  <p className="text-xs text-red-800">{article.reviewNotes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                {article.status === 'PUBLISHED' && (
                  <Link
                    href={`/media/${article.slug}`}
                    target="_blank"
                    className="btn-secondary btn-sm"
                  >
                    <Eye className="h-3 w-3" />
                    View Published
                  </Link>
                )}
                {(article.status === 'DRAFT' || article.status === 'REJECTED') && (
                  <button
                    onClick={() => {
                      setSelectedArticle(article)
                      setView('edit')
                    }}
                    className="btn-secondary btn-sm"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                )}
                {article.status === 'DRAFT' && (
                  <button
                    onClick={() => {
                      setSelectedArticle(article)
                      setView('edit')
                    }}
                    className="btn-primary btn-sm"
                  >
                    <Send className="h-3 w-3" />
                    Submit for Review
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
