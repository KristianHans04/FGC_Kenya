'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image,
  Video,
  Download,
  Share2,
  BarChart,
  TrendingUp,
  User,
  Calendar,
  Tag,
  Brain,
  X
} from 'lucide-react'
// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface MediaItem {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  type: 'article' | 'video' | 'image' | 'document'
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected'
  author: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
  category?: string
  tags: string[]
  viewCount: number
  shareCount: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
  approvedBy?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  cohort?: string
  semanticEmbedding?: any // For semantic search
}

export default function MediaManagement() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword')
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    author: 'all',
    cohort: 'all'
  })
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [semanticSearchResults, setSemanticSearchResults] = useState<any[]>([])

  useEffect(() => {
    fetchMedia()
  }, [filter])

  // Debounced semantic search
  const performSemanticSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 3) {
        setSemanticSearchResults([])
        return
      }

      try {
        const response = await fetch('/api/admin/media/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query,
            mode: 'semantic',
            limit: 20
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setSemanticSearchResults(data.data?.results || [])
        }
      } catch (error) {
        console.error('Semantic search failed:', error)
      }
    }, 500),
    []
  )

  useEffect(() => {
    if (searchMode === 'semantic' && searchTerm) {
      performSemanticSearch(searchTerm)
    }
  }, [searchTerm, searchMode])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.status !== 'all') params.append('status', filter.status)
      if (filter.type !== 'all') params.append('type', filter.type)
      if (filter.author !== 'all') params.append('author', filter.author)
      if (filter.cohort !== 'all') params.append('cohort', filter.cohort)
      if (searchMode === 'keyword' && searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/admin/media?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.data?.media || [])
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (mediaId: string) => {
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mediaId, action: 'approve' })
      })
      if (response.ok) {
        fetchMedia()
      }
    } catch (error) {
      console.error('Failed to approve media:', error)
    }
  }

  const handleReject = async (mediaId: string, feedback?: string) => {
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, action: 'reject', feedback })
      })
      if (response.ok) {
        fetchMedia()
      }
    } catch (error) {
      console.error('Failed to reject media:', error)
    }
  }

  const handlePublish = async (mediaId: string) => {
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mediaId, action: 'publish' })
      })
      if (response.ok) {
        fetchMedia()
      }
    } catch (error) {
      console.error('Failed to publish media:', error)
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE'
      })
      fetchMedia()
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia(null)
      }
    } catch (error) {
      console.error('Failed to delete media:', error)
    }
  }

  const getStatusColor = (status: MediaItem['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'article': return FileText
      case 'video': return Video
      case 'image': return Image
      case 'document': return FileText
      default: return FileText
    }
  }

  const displayMedia = searchMode === 'semantic' && semanticSearchResults.length > 0
    ? semanticSearchResults
    : media

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Media Management</h1>
          <p className="text-muted-foreground">Manage all platform media with semantic search</p>
        </div>
        <Link
          href="/admin/media/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Media
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-card p-4 rounded-lg border space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              {searchMode === 'semantic' && (
                <Brain className="h-4 w-4 text-primary" />
              )}
            </div>
            <input
              type="text"
              placeholder={searchMode === 'semantic' 
                ? "Search by concept, idea, or memory (e.g., 'that article about teamwork')"
                : "Search by title, author, or keyword..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode('keyword')}
              className={`px-3 py-2 rounded-lg border ${
                searchMode === 'keyword' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              Keyword
            </button>
            <button
              onClick={() => setSearchMode('semantic')}
              className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                searchMode === 'semantic' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Brain className="h-4 w-4" />
              Semantic
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
          </select>

          <select
            value={filter.cohort}
            onChange={(e) => setFilter({ ...filter, cohort: e.target.value })}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="all">All Cohorts</option>
            <option value="FGC2023">FGC2023</option>
            <option value="FGC2024">FGC2024</option>
            <option value="FGC2025">FGC2025</option>
          </select>
        </div>

        {searchMode === 'semantic' && searchTerm && (
          <div className="text-sm text-muted-foreground">
            <Brain className="inline h-3 w-3 mr-1" />
            Using AI to find content matching: "{searchTerm}"
          </div>
        )}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : displayMedia.length === 0 ? (
          <div className="col-span-full bg-card rounded-lg border p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No media found matching your search' : 'No media found'}
            </p>
          </div>
        ) : (
          displayMedia.map((item) => {
            const TypeIcon = getTypeIcon(item.type)
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {/* Thumbnail */}
                <div className="h-48 bg-muted flex items-center justify-center">
                  <TypeIcon className="h-12 w-12 text-muted-foreground" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <User className="h-3 w-3" />
                    <span>{item?.author?.firstName || item?.author?.email?.split('@')[0] || 'Unknown'}</span>
                    {item.cohort && (
                      <>
                        <span>•</span>
                        <span>{item.cohort}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {item.shareCount}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.status === 'pending_approval' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApprove(item.id)
                        }}
                        className="flex-1 px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const feedback = prompt('Rejection feedback (optional):')
                          handleReject(item.id, feedback || undefined)
                        }}
                        className="flex-1 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {item.status === 'approved' && (
                    <div className="mt-3 pt-3 border-t">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePublish(item.id)
                        }}
                        className="w-full px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
                      >
                        Publish
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedMedia.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedMedia.author?.firstName || selectedMedia.author?.email || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedMedia.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMedia.status)}`}>
                    {selectedMedia.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-2 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: selectedMedia.content }} />
            </div>

            {selectedMedia.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {selectedMedia.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-muted rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedMedia.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  {selectedMedia.shareCount} shares
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/media/${selectedMedia.id}/edit`}
                  className="px-3 py-1.5 border rounded hover:bg-muted"
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/media/${selectedMedia.id}/analytics`}
                  className="px-3 py-1.5 border rounded hover:bg-muted"
                >
                  Analytics
                </Link>
                <button
                  onClick={() => {
                    handleDelete(selectedMedia.id)
                    setSelectedMedia(null)
                  }}
                  className="px-3 py-1.5 border rounded text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
