'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  School,
  User,
  FileText,
  Clock,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'

interface Applicant {
  id: string
  applicationId: string
  status: 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewNotes?: string
  rejectionFeedback?: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    school?: string
    year?: string
  }
  responses: Record<string, any>
  score?: number
  reviewer?: {
    email: string
    firstName?: string
    lastName?: string
  }
}

interface ApplicationCall {
  id: string
  title: string
  year: string
  status: string
  maxApplications?: number
  currentApplications: number
  shortlistedCount: number
  acceptedCount: number
  rejectedCount: number
}

type StatusFilter = 'all' | 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'
type SortBy = 'submittedAt' | 'name' | 'school' | 'score'

export default function ApplicationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const callId = params.callId as string
  
  const { isLoading: authLoading, isAuthenticated } = useAuth()

  const [applicationCall, setApplicationCall] = useState<ApplicationCall | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('submittedAt')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailType, setEmailType] = useState<'accept' | 'reject'>('accept')
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [sendingEmails, setSendingEmails] = useState(false)

  useEffect(() => {
    document.title = 'Review Applications | FIRST Global Team Kenya'
  }, [])

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (callId) {
      fetchApplicationCall()
      fetchApplicants()
    }
  }, [callId])

  const fetchApplicationCall = async () => {
    try {
      const response = await fetch(`/api/admin/applications/calls/${callId}`, {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setApplicationCall(data.data?.call)
      }
    } catch (error) {
      console.error('Failed to fetch application call:', error)
      // Mock data
      setApplicationCall({
        id: callId,
        title: 'FIRST Global Challenge 2025',
        year: '2025',
        status: 'active',
        maxApplications: 200,
        currentApplications: 45,
        shortlistedCount: 15,
        acceptedCount: 0,
        rejectedCount: 5
      })
    }
  }

  const fetchApplicants = async () => {
    try {
      const response = await fetch(`/api/admin/applications/calls/${callId}/applicants`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplicants(data.data?.applicants || [])
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error)
      // Mock data
      const mockApplicants: Applicant[] = [
        {
          id: '1',
          applicationId: 'app1',
          status: 'submitted',
          submittedAt: '2025-01-15T10:00:00Z',
          user: {
            id: 'user1',
            email: 'john.doe@school.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+254700000001',
            school: 'Nairobi High School',
            year: 'Form 3'
          },
          responses: {
            motivation: 'I am passionate about robotics...',
            experience: 'Participated in school science fair...'
          },
          score: 85
        },
        {
          id: '2',
          applicationId: 'app2',
          status: 'shortlisted',
          submittedAt: '2025-01-14T09:00:00Z',
          reviewedAt: '2025-01-16T14:00:00Z',
          user: {
            id: 'user2',
            email: 'jane.smith@school.com',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+254700000002',
            school: 'Mombasa Academy',
            year: 'Form 4'
          },
          responses: {
            motivation: 'I want to represent my country...',
            experience: 'Led robotics club for 2 years...'
          },
          score: 92,
          reviewer: {
            email: 'admin@fgc.ke'
          }
        }
      ]
      setApplicants(mockApplicants)
    } finally {
      setLoading(false)
    }
  }

  const handleShortlist = async (applicantId: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/shortlist`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setApplicants(prev => prev.map(a => 
          a.id === applicantId ? { ...a, status: 'shortlisted' as const } : a
        ))
      }
    } catch (error) {
      console.error('Failed to shortlist applicant:', error)
    }
  }

  const handleAccept = async (applicantIds: string[]) => {
    setEmailType('accept')
    setSelectedApplicants(applicantIds)
    setShowEmailModal(true)
  }

  const handleReject = async (applicantIds: string[]) => {
    setEmailType('reject')
    setSelectedApplicants(applicantIds)
    setShowEmailModal(true)
  }

  const sendEmails = async (message?: string) => {
    setSendingEmails(true)
    try {
      const endpoint = emailType === 'accept' 
        ? '/api/admin/applications/accept' 
        : '/api/admin/applications/reject'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          applicationIds: selectedApplicants,
          message,
          callId
        })
      })
      
      if (response.ok) {
        const newStatus = emailType === 'accept' ? 'accepted' : 'rejected'
        setApplicants(prev => prev.map(a => 
          selectedApplicants.includes(a.id) 
            ? { ...a, status: newStatus as any, rejectionFeedback: message } 
            : a
        ))
        setShowEmailModal(false)
        setSelectedApplicants([])
      }
    } catch (error) {
      console.error('Failed to send emails:', error)
    } finally {
      setSendingEmails(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      submitted: { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock },
      under_review: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', icon: Eye },
      shortlisted: { bg: 'bg-primary/10', text: 'text-primary', icon: Star },
      accepted: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', icon: XCircle }
    }
    
    const badge = badges[status as keyof typeof badges] || badges.submitted
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    )
  }

  // Filter and sort applicants
  const filteredApplicants = applicants
    .filter(applicant => {
      const matchesSearch = searchTerm === '' ||
        applicant.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.user.school?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`)
        case 'school':
          return (a.user.school || '').localeCompare(b.user.school || '')
        case 'score':
          return (b.score || 0) - (a.score || 0)
        case 'submittedAt':
        default:
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      }
    })

  // Calculate stats
  const stats = {
    total: applicants.length,
    submitted: applicants.filter(a => a.status === 'submitted').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/applications"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {applicationCall?.title || 'Review Applications'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Review and manage applicants for {applicationCall?.year}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">New</p>
          <p className="text-2xl font-bold text-foreground">{stats.submitted}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Shortlisted</p>
          <p className="text-2xl font-bold text-primary">{stats.shortlisted}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="submittedAt">Date Submitted</option>
              <option value="name">Name</option>
              <option value="school">School</option>
              <option value="score">Score</option>
            </select>

            <button
              onClick={fetchApplicants}
              className="px-3 py-2 border border-border rounded-lg hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              className="px-3 py-2 border border-border rounded-lg hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedApplicants.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">
              {selectedApplicants.length} selected
            </span>
            <button
              onClick={() => handleAccept(selectedApplicants)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Accept Selected
            </button>
            <button
              onClick={() => handleReject(selectedApplicants)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Reject Selected
            </button>
            <button
              onClick={() => setSelectedApplicants([])}
              className="px-3 py-1 border border-border rounded text-sm hover:bg-muted"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Applicants List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApplicants(filteredApplicants.map(a => a.id))
                      } else {
                        setSelectedApplicants([])
                      }
                    }}
                  />
                </th>
                <th className="text-left p-4">Applicant</th>
                <th className="text-left p-4 hidden sm:table-cell">School</th>
                <th className="text-left p-4 hidden lg:table-cell">Submitted</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4 hidden md:table-cell">Score</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    No applicants found
                  </td>
                </tr>
              ) : (
                filteredApplicants.map(applicant => (
                  <tr key={applicant.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.includes(applicant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplicants([...selectedApplicants, applicant.id])
                          } else {
                            setSelectedApplicants(selectedApplicants.filter(id => id !== applicant.id))
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {applicant.user.firstName} {applicant.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{applicant.user.email}</p>
                        {applicant.user.phone && (
                          <p className="text-xs text-muted-foreground">{applicant.user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div>
                        <p className="text-sm text-foreground">{applicant.user.school || '-'}</p>
                        <p className="text-xs text-muted-foreground">{applicant.user.year || '-'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(applicant.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(applicant.status)}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {applicant.score && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{applicant.score}</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${applicant.score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedApplicant(applicant)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {applicant.status === 'submitted' && (
                          <button
                            onClick={() => handleShortlist(applicant.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                            title="Shortlist"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        
                        {applicant.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => handleAccept([applicant.id])}
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-green-600"
                              title="Accept"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject([applicant.id])}
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-red-600"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Details Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedApplicant(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedApplicant.user.firstName} {selectedApplicant.user.lastName}
                  </h2>
                  <p className="text-muted-foreground">{selectedApplicant.user.email}</p>
                </div>
                {getStatusBadge(selectedApplicant.status)}
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{selectedApplicant.user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">School</p>
                      <p className="font-medium text-foreground">{selectedApplicant.user.school || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium text-foreground">{selectedApplicant.user.year || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedApplicant.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Responses */}
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Application Responses</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedApplicant.responses).map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Notes */}
                {selectedApplicant.reviewNotes && (
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Review Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {selectedApplicant.reviewNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                  >
                    Close
                  </button>
                  {selectedApplicant.status === 'submitted' && (
                    <button
                      onClick={() => {
                        handleShortlist(selectedApplicant.id)
                        setSelectedApplicant(null)
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Shortlist Applicant
                    </button>
                  )}
                  {selectedApplicant.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => {
                          handleAccept([selectedApplicant.id])
                          setSelectedApplicant(null)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          handleReject([selectedApplicant.id])
                          setSelectedApplicant(null)
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !sendingEmails && setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-foreground">
                {emailType === 'accept' ? 'Send Acceptance Emails' : 'Send Rejection Emails'}
              </h2>
              
              <p className="text-sm text-muted-foreground mb-4">
                {emailType === 'accept' 
                  ? `You are about to send acceptance emails to ${selectedApplicants.length} applicant(s).`
                  : `You are about to send rejection emails to ${selectedApplicants.length} applicant(s).`
                }
              </p>

              {emailType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Rejection Feedback (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    rows={4}
                    placeholder="Provide feedback for the rejected applicants (optional)..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If left empty, a warm generic rejection email will be sent
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  disabled={sendingEmails}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendEmails()}
                  disabled={sendingEmails}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 ${
                    emailType === 'accept' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {sendingEmails ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Emails
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}