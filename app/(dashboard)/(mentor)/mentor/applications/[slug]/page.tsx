'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  School,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react'
import { useFlashNotification } from '@/app/lib/hooks/useFlashNotification'

interface Application {
  id: string
  slug: string
  status: string
  submittedAt: string
  score?: number
  user: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    school?: string
    county?: string
  }
}

export default function MentorApplicationReviewPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params)
  const router = useRouter()
  const { addNotification } = useFlashNotification()
  
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    document.title = 'Review Applications | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Review student applications for FIRST Global Team Kenya')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Review student applications for FIRST Global Team Kenya'
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    checkAccessAndFetchApplications()
  }, [slug])

  const checkAccessAndFetchApplications = async () => {
    try {
      // First check if mentor has access
      const accessResponse = await fetch('/api/mentor/applications/access')
      const accessData = await accessResponse.json()
      
      if (!accessData.success || !accessData.data.hasAccess) {
        addNotification(
          'You do not have permission to review applications',
          'error'
        )
        router.push('/mentor/applications')
        return
      }
      
      setHasAccess(true)

      // Fetch applications for review (read-only access)
      const appsResponse = await fetch(`/api/admin/applications/calls/${slug}/applications`)
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.data?.applications || [])
      } else {
        addNotification(
          'Failed to load applications',
          'error'
        )
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      addNotification(
        'Failed to load applications',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.user.firstName || ''} ${app.user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.school?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'SHORTLISTED':
        return 'bg-purple-100 text-purple-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'UNDER_REVIEW':
      case 'SHORTLISTED':
        return <Clock className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Checking access permissions...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/mentor/applications"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Access
        </Link>
        <h1 className="text-3xl font-bold mb-2">Application Review</h1>
        <p className="text-muted-foreground">
          Review applications for this cohort (read-only access)
        </p>
      </div>

      {/* Notice about read-only access */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Read-Only Access</p>
            <p className="text-sm text-blue-700 mt-1">
              As a mentor, you have read-only access to review applications. 
              You can view application details but cannot modify statuses or scores.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{applications.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Submitted</p>
          <p className="text-2xl font-bold">
            {applications.filter(a => a.status === 'SUBMITTED').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Under Review</p>
          <p className="text-2xl font-bold">
            {applications.filter(a => a.status === 'UNDER_REVIEW').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Shortlisted</p>
          <p className="text-2xl font-bold">
            {applications.filter(a => a.status === 'SHORTLISTED').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Accepted</p>
          <p className="text-2xl font-bold">
            {applications.filter(a => a.status === 'ACCEPTED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No applications found</p>
          </div>
        ) : (
          filteredApplications.map(application => (
            <div key={application.id} className="bg-card rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold">
                      {application.user.firstName || application.user.lastName
                        ? `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim()
                        : application.user.email.split('@')[0]}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      {application.status.replace('_', ' ')}
                    </span>
                    {application.score && (
                      <span className="text-sm font-medium">
                        Score: {application.score}/100
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{application.user.email}</span>
                    </div>
                    {application.user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{application.user.phone}</span>
                      </div>
                    )}
                    {application.user.school && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <School className="h-4 w-4" />
                        <span>{application.user.school}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted {new Date(application.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {application.user.county && (
                      <span>County: {application.user.county}</span>
                    )}
                  </div>
                </div>

                <button
                  className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
                  title="View-only access"
                  disabled
                >
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}