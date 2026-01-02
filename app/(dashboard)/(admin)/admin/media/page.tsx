/**
 * @file app/(dashboard)/(admin)/admin/media/page.tsx
 * @description Admin media management with semantic search, drafts, approval workflow
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  MoreVertical,
  Send
} from 'lucide-react'
import MediaEditorV2 from '@/app/components/media/MediaEditorV2'

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
  publishedAt?: string
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
    email: string
  }
  reviewedAt?: string
  reviewNotes?: string
}

export default function AdminMediaManagement() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    pending: 0,
    published: 0,
    rejected: 0
  })

  useEffect(() => {
    document.title = 'Media Management | Admin Dashboard'
  }, [])

  useEffect(() => {
    if (view === 'list') {
      fetchArticles()
      fetchStats()
    }
  }, [view, statusFilter])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/media/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [total, drafts, pending, published, rejected] = await Promise.all([
        fetch('/api/media/articles').then(r => r.json()).then(d => d.pagination?.total || 0),
        fetch('/api/media/articles?status=DRAFT').then(r => r.json()).then(d => d.pagination?.total || 0),
        fetch('/api/media/articles?status=PENDING_REVIEW').then(r => r.json()).then(d => d.pagination?.total || 0),
        fetch('/api/media/articles?status=PUBLISHED').then(r => r.json()).then(d => d.pagination?.total || 0),
        fetch('/api/media/articles?status=REJECTED').then(r => r.json()).then(d => d.pagination?.total || 0),
      ])

      setStats({ total, drafts, pending, published, rejected })
    } catch (error) {
      console.error('Error fetching stats:', error)
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
        fetchStats()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save article')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      throw error
    }
  }

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/media/articles/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchArticles()
        fetchStats()
      } else {
        alert('Failed to delete article')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article')
    }
  }

  const handleApproveArticle = async (slug: string) => {
    try {
      const response = await fetch(`/api/media/articles/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      })

      if (response.ok) {
        fetchArticles()
        fetchStats()
      }
    } catch (error) {
      console.error('Error approving article:', error)
    }
  }

  const handleRejectArticle = async (slug: string, notes: string) => {
    try {
      const response = await fetch(`/api/media/articles/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', reviewNotes: notes })
      })

      if (response.ok) {
        fetchArticles()
        fetchStats()
      }
    } catch (error) {
      console.error('Error rejecting article:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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

  // Editor View
  if (view === 'create' || view === 'edit') {
    return (
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
        userRole="ADMIN"
      />
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
            Manage all articles and content across the platform
          </p>
        </div>
        <button
          onClick={() => setView('create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Article
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted-foreground">Drafts</div>
          <div className="text-2xl font-bold">{stats.drafts}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted-foreground">Pending Review</div>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted-foreground">Published</div>
          <div className="text-2xl font-bold">{stats.published}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted-foreground">Rejected</div>
          <div className="text-2xl font-bold">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles by title, content, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchArticles()}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Drafts</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first article'}
          </p>
          <button onClick={() => setView('create')} className="btn-primary">
            Create Article
          </button>
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
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
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
                        <span>By {article.author.firstName} {article.author.lastName}</span>
                        <span>•</span>
                        <span>{formatDate(article.createdAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.viewCount} views
                        </span>
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
                    {article.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleApproveArticle(article.slug)}
                          className="btn-sm bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Rejection notes (optional):')
                            if (notes !== null) {
                              handleRejectArticle(article.slug, notes)
                            }
                          }}
                          className="btn-sm bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteArticle(article.slug)}
                      className="btn-sm bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
