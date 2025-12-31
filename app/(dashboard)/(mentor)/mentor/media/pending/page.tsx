'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Video, 
  Image,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  MessageSquare,
  User,
  Calendar,
  Filter
} from 'lucide-react'

interface PendingMedia {
  id: string
  title: string
  description: string
  type: 'video' | 'image' | 'document'
  studentName: string
  studentId: string
  cohort: string
  submittedAt: string
  fileUrl: string
  fileSize: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNotes?: string
  tags: string[]
}

export default function MentorMediaPendingPage() {
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMedia, setSelectedMedia] = useState<PendingMedia | null>(null)
  const [filterCohort, setFilterCohort] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [reviewNotes, setReviewNotes] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    fetchPendingMedia()
  }, [])

  const fetchPendingMedia = async () => {
    try {
      const response = await fetch('/api/mentor/media/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingMedia(data.data?.media || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending media:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data
  const mockPendingMedia: PendingMedia[] = [
    {
      id: '1',
      title: 'Robot Assembly Tutorial',
      description: 'Step-by-step guide for assembling the competition robot',
      type: 'video',
      studentName: 'Sarah Johnson',
      studentId: 'student1',
      cohort: '2024',
      submittedAt: '2024-03-14T10:30:00',
      fileUrl: '/media/assembly-tutorial.mp4',
      fileSize: '125 MB',
      status: 'pending',
      tags: ['tutorial', 'assembly', 'robotics']
    },
    {
      id: '2',
      title: 'Programming Documentation',
      description: 'Complete documentation of our robot control system',
      type: 'document',
      studentName: 'James Mwangi',
      studentId: 'student2',
      cohort: '2024',
      submittedAt: '2024-03-13T14:20:00',
      fileUrl: '/media/programming-docs.pdf',
      fileSize: '3.5 MB',
      status: 'pending',
      tags: ['documentation', 'programming']
    },
    {
      id: '3',
      title: 'Team Photo Gallery',
      description: 'Photos from our recent workshop and team activities',
      type: 'image',
      studentName: 'Mary Wanjiru',
      studentId: 'student3',
      cohort: '2024',
      submittedAt: '2024-03-12T09:15:00',
      fileUrl: '/media/team-photos.zip',
      fileSize: '45 MB',
      status: 'pending',
      tags: ['team', 'photos', 'workshop']
    }
  ]

  const displayMedia = pendingMedia.length > 0 ? pendingMedia : mockPendingMedia

  const filteredMedia = displayMedia.filter(media => {
    const matchesCohort = filterCohort === 'all' || media.cohort === filterCohort
    const matchesType = filterType === 'all' || media.type === filterType
    return matchesCohort && matchesType && media.status === 'pending'
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-6 w-6 text-blue-600" />
      case 'image':
        return <Image className="h-6 w-6 text-green-600" />
      case 'document':
        return <FileText className="h-6 w-6 text-purple-600" />
      default:
        return <FileText className="h-6 w-6 text-gray-600" />
    }
  }

  const handleApprove = async (mediaId: string) => {
    try {
      await fetch(`/api/mentor/media/${mediaId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes })
      })
      fetchPendingMedia()
      setShowReviewModal(false)
      setSelectedMedia(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Failed to approve media:', error)
    }
  }

  const handleReject = async (mediaId: string) => {
    if (!reviewNotes.trim()) {
      alert('Please provide feedback for rejection')
      return
    }
    
    try {
      await fetch(`/api/mentor/media/${mediaId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reviewNotes })
      })
      fetchPendingMedia()
      setShowReviewModal(false)
      setSelectedMedia(null)
      setReviewNotes('')
    } catch (error) {
      console.error('Failed to reject media:', error)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pending Media Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve student submitted content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pending Review</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{filteredMedia.length}</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Approved Today</span>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-green-600">8</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Rejected Today</span>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-red-600">2</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Review Time</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">4.2h</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Cohorts</option>
            <option value="2024">2024 Cohort</option>
            <option value="2023">2023 Cohort</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
          </select>

          <button className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2 ml-auto">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-card rounded-lg border">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-muted-foreground">No pending media to review</p>
            <p className="text-sm text-muted-foreground mt-2">All submissions have been reviewed</p>
          </div>
        ) : (
          filteredMedia.map(media => (
            <div key={media.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getTypeIcon(media.type)}
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending Review
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{media.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {media.description}
                </p>

                {/* Student Info */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{media.studentName}</div>
                    <div className="text-muted-foreground">Cohort {media.cohort}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(media.submittedAt).toLocaleString()}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {media.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>File size: {media.fileSize}</span>
                  <span>Type: {media.type}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMedia(media)
                      setShowReviewModal(true)
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </button>
                  <button className="px-4 py-2 border rounded-lg hover:bg-muted">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Review Media Submission</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">{selectedMedia.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedMedia.description}
              </p>
              <div className="text-sm">
                <span className="text-muted-foreground">Submitted by: </span>
                <span className="font-medium">{selectedMedia.studentName}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add feedback or notes for the student..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(selectedMedia.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedMedia.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedMedia(null)
                  setReviewNotes('')
                }}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}