/**
 * @file app/(dashboard)/(mentor)/mentor/media/page.tsx
 * @description Mentor media management - manage own articles and approve student articles
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
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageCircle
} from 'lucide-react'
import MediaEditor from '@/app/components/media/MediaEditor'

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
  cohortRestriction?: string
  author: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    role: string
  }
  reviewedBy?: {
    id: string
    firstName?: string
    lastName?: string
  }
  reviewedAt?: string
  reviewNotes?: string
}

export default function MentorMediaPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [filter, setFilter] = useState<'all' | 'mine' | 'pending'>('pending')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [articleToReview, setArticleToReview] = useState<Article | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    document.title = 'Media Management | Mentor Dashboard'
  }, [])

  useEffect(() => {
    if (view === 'list') {
      fetchArticles()
    }
  }, [view, filter])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filter === 'pending') {
        params.append('status', 'PENDING_REVIEW')
      }

      const response = await fetch(`/api/media/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        let filteredArticles = data.articles || []

        // Filter by own articles if selected
        if (filter === 'mine') {
          // API will return own articles automatically
        }

        setArticles(filteredArticles)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveArticle = async (data: any, publish: boolean) => {
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

  const handleReviewArticle = async () => {
    if (!articleToReview) return

    try {
      const status = reviewAction === 'approve' ? 'PUBLISHED' : 'REJECTED'
      
      const response = await fetch(`/api/media/articles/${articleToReview.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          reviewNotes: reviewNotes || undefined
        })
      })

      if (response.ok) {
        setReviewDialogOpen(false)
        setArticleToReview(null)
        setReviewNotes('')
        fetchArticles()
      } else {
        alert('Failed to review article')
      }
    } catch (error) {
      console.error('Error reviewing article:', error)
      alert('Failed to review article')
    }
  }

  const openReviewDialog = (article: Article, action: 'approve' | 'reject') => {
    setArticleToReview(article)
    setReviewAction(action)
    setReviewDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; icon: any }> = {
      DRAFT: { class: 'bg-gray-100 text-gray-800', icon: Clock },
      PENDING_REVIEW: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
      PUBLISHED: { class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      REJECTED: { class: 'bg-red-100 text-red-800', icon: XCircle },
    }

    const badge = badges[status] || badges.DRAFT
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
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
        <MediaEditor
          article={selectedArticle && selectedArticle.status !== 'REJECTED' ? {
            id: selectedArticle.id,
            title: selectedArticle.title,
            excerpt: selectedArticle.excerpt,
            content: selectedArticle.content,
            coverImage: selectedArticle.coverImage,
            tags: selectedArticle.tags,
            status: selectedArticle.status as 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED'
          } : undefined}
          onSave={(data) => handleSaveArticle(data, false)}
          onClose={() => {
            setView('list')
            setSelectedArticle(null)
          }}
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
          <h1 className="text-3xl font-bold">Media Management</h1>
          <p className="text-muted-foreground mt-1">
            Review student articles and manage your own content
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

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'pending'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setFilter('mine')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'mine'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Articles
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Articles
        </button>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'pending' ? 'No articles pending review' : 'No articles found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'pending' 
              ? 'There are no articles waiting for your review at this time'
              : filter === 'mine'
              ? 'Start by creating your first article'
              : 'No articles available'}
          </p>
          {filter === 'mine' && (
            <button onClick={() => setView('create')} className="btn-primary">
              Create Article
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex gap-4">
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-32 h-24 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author.firstName} {article.author.lastName}
                        </span>
                        <span>•</span>
                        <span>{formatDate(article.createdAt)}</span>
                        {article.status === 'PUBLISHED' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.viewCount} views
                            </span>
                          </>
                        )}
                        {article.cohortRestriction && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">{article.cohortRestriction}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(article.status)}
                    </div>
                  </div>

                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-muted text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/media/${article.slug}`}
                      target="_blank"
                      className="btn-secondary btn-sm"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Link>
                    
                    {article.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          onClick={() => openReviewDialog(article, 'approve')}
                          className="btn-sm bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewDialog(article, 'reject')}
                          className="btn-sm bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {reviewDialogOpen && articleToReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold">
              {reviewAction === 'approve' ? 'Approve Article' : 'Reject Article'}
            </h2>
            
            <div className="space-y-2">
              <h3 className="font-semibold">{articleToReview.title}</h3>
              <p className="text-sm text-muted-foreground">{articleToReview.excerpt}</p>
            </div>

            <div>
              <label htmlFor="reviewNotes" className="block text-sm font-medium mb-2">
                {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </label>
              <textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="input w-full"
                rows={4}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Add any notes or feedback...'
                    : 'Explain why this article is being rejected...'
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setReviewDialogOpen(false)
                  setArticleToReview(null)
                  setReviewNotes('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewArticle}
                className={
                  reviewAction === 'approve'
                    ? 'btn-primary'
                    : 'bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
                }
              >
                {reviewAction === 'approve' ? 'Approve & Publish' : 'Reject Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
