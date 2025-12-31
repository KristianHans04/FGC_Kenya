'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react'

export default function StudentMediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/student/media')
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

  // Mock data for display
  const studentMedia = [
    {
      id: '1',
      title: 'Robot Assembly Tutorial',
      type: 'video',
      status: 'approved',
      description: 'Step-by-step guide for assembling the robot base',
      uploadedAt: new Date().toISOString(),
      approvedBy: 'Mentor John',
      views: 45,
      size: '125 MB'
    },
    {
      id: '2',
      title: 'Competition Strategy Document',
      type: 'document',
      status: 'pending',
      description: 'Our team strategy for the upcoming competition',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      views: 12,
      size: '2.3 MB'
    },
    {
      id: '3',
      title: 'Team Photo at Workshop',
      type: 'image',
      status: 'rejected',
      description: 'Team collaboration during the weekend workshop',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      rejectionReason: 'Image quality too low',
      views: 8,
      size: '4.5 MB'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-8 w-8 text-blue-600" />
      case 'image':
        return <Image className="h-8 w-8 text-green-600" />
      case 'document':
        return <FileText className="h-8 w-8 text-purple-600" />
      default:
        return <FileText className="h-8 w-8 text-gray-600" />
    }
  }

  const filteredMedia = filterStatus === 'all' 
    ? studentMedia 
    : studentMedia.filter(m => m.status === filterStatus)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Content</h1>
          <p className="text-muted-foreground">Manage your media and resources</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Upload Content
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        {['all', 'approved', 'pending', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              filterStatus === status 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No content found
          </div>
        ) : (
          filteredMedia.map(item => (
            <div key={item.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getTypeIcon(item.type)}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="text-sm capitalize">{item.status}</span>
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

                {item.status === 'rejected' && item.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Rejection reason:</strong> {item.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  <span>{item.size}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{item.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-muted rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    {item.status !== 'approved' && (
                      <button className="p-2 hover:bg-muted rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-muted rounded">
                      <Download className="h-4 w-4" />
                    </button>
                    {item.status !== 'approved' && (
                      <button className="p-2 hover:bg-muted rounded text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your files here, or click to browse
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Choose Files
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Select content type</option>
                <option>Video</option>
                <option>Image</option>
                <option>Document</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
