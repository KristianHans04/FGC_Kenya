'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  School,
  MapPin,
  FileText,
  Award,
  AlertCircle,
  MessageSquare,
  Save,
  Send,
  User,
  Edit3,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Users
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { cn } from '@/app/lib/utils'
import { format, differenceInYears } from 'date-fns'

interface Application {
  id: string
  userId: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  submittedAt: string
  reviewedAt?: string
  reviewedById?: string
  score?: number
  notes?: string
  reviewerFeedback?: string
  formData: Record<string, any>
  user: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    school?: string
    county?: string
    dateOfBirth?: string
    gender?: string
    nationality?: string
    parentName?: string
    parentPhone?: string
    parentEmail?: string
  }
  reviewedBy?: {
    firstName?: string
    lastName?: string
    email: string
  }
}

interface ReviewNote {
  id: string
  content: string
  isPrivate: boolean
  createdAt: string
  createdBy: {
    firstName?: string
    lastName?: string
    email: string
  }
}

export default function ApplicantReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const callId = params.slug as string
  const applicantId = params.applicantSlug as string

  const [application, setApplication] = useState<Application | null>(null)
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [score, setScore] = useState<number>(0)
  const [privateNote, setPrivateNote] = useState('')
  const [reviewerFeedback, setReviewerFeedback] = useState('')
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [pendingDecision, setPendingDecision] = useState<'ACCEPTED' | 'REJECTED' | 'SHORTLISTED' | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (applicantId) {
      fetchApplication()
      fetchReviewNotes()
    }
  }, [applicantId])

  useEffect(() => {
    if (application) {
      document.title = `${application.user.firstName || 'Applicant'} ${application.user.lastName || ''} - Review | FIRST Global Team Kenya`
      setScore(application.score || 0)
      setReviewerFeedback(application.reviewerFeedback || '')
    }
  }, [application])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplication(data.data.application)
      } else {
        // Mock data for development
        const mockApplication: Application = {
          id: applicantId,
          userId: 'user1',
          status: 'SUBMITTED',
          submittedAt: '2025-01-01T10:30:00Z',
          score: 85,
          formData: {
            motivation: 'I am deeply passionate about robotics and STEM education. My journey started in middle school when I first encountered programming through a local coding bootcamp. Since then, I have been fascinated by the intersection of technology and problem-solving. Participating in FIRST Global would be a dream come true as it represents the pinnacle of international STEM competition.',
            experience: 'I have been actively involved in robotics for the past 3 years. I serve as the captain of my school robotics team, where we have won 2 regional competitions and placed 3rd in the national championship last year. I have experience with Arduino, Raspberry Pi, Python programming, and mechanical design using CAD software.',
            achievements: 'Regional Robotics Champion 2023, National Science Fair Bronze Medal 2024, Lead organizer of STEM workshop for 200+ students',
            teamwork: 'As team captain, I have learned to coordinate diverse skill sets and manage project timelines. I believe in inclusive leadership and ensuring every team member contributes their unique strengths.',
            goals: 'My goal is to pursue engineering at university and eventually start a company that develops educational robotics platforms for schools in underserved communities across Africa.'
          },
          user: {
            email: 'jane.doe@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+254700000001',
            school: 'Nairobi Academy',
            county: 'Nairobi',
            dateOfBirth: '2007-03-15',
            gender: 'Female',
            nationality: 'Kenyan',
            parentName: 'Mary Doe',
            parentPhone: '+254700000002',
            parentEmail: 'mary.doe@example.com'
          }
        }
        setApplication(mockApplication)
      }
    } catch (error) {
      console.error('Failed to fetch application:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewNotes = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/notes`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setReviewNotes(data.data.notes || [])
      } else {
        // Mock data for development
        const mockNotes: ReviewNote[] = [
          {
            id: '1',
            content: 'Strong technical background demonstrated through portfolio. Leadership experience as team captain is impressive.',
            isPrivate: true,
            createdAt: '2025-01-02T09:30:00Z',
            createdBy: {
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@fgc.ke'
            }
          },
          {
            id: '2',
            content: 'Follow up needed on mathematics competition results mentioned in essay.',
            isPrivate: true,
            createdAt: '2025-01-02T14:15:00Z',
            createdBy: {
              firstName: 'Review',
              lastName: 'Team',
              email: 'reviewer@fgc.ke'
            }
          }
        ]
        setReviewNotes(mockNotes)
      }
    } catch (error) {
      console.error('Failed to fetch review notes:', error)
    }
  }

  const handleSaveProgress = async () => {
    if (!application) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          score: score,
          status: 'UNDER_REVIEW',
          reviewerFeedback: reviewerFeedback
        })
      })
      
      if (response.ok) {
        setApplication(prev => prev ? { 
          ...prev, 
          score, 
          status: 'UNDER_REVIEW',
          reviewerFeedback,
          reviewedAt: new Date().toISOString(),
          reviewedById: user?.id 
        } : null)
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!privateNote.trim()) return
    
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: privateNote,
          isPrivate: true
        })
      })
      
      if (response.ok) {
        const newNote: ReviewNote = {
          id: Date.now().toString(),
          content: privateNote,
          isPrivate: true,
          createdAt: new Date().toISOString(),
          createdBy: {
            firstName: user?.firstName || undefined,
            lastName: user?.lastName || undefined,
            email: user?.email || ''
          }
        }
        setReviewNotes(prev => [newNote, ...prev])
        setPrivateNote('')
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleFinalDecision = async (decision: 'ACCEPTED' | 'REJECTED' | 'SHORTLISTED') => {
    if (!application) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/applications/${applicantId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: decision,
          score: score,
          reviewerFeedback: reviewerFeedback,
          sendNotification: true
        })
      })
      
      if (response.ok) {
        setApplication(prev => prev ? { 
          ...prev, 
          status: decision, 
          score,
          reviewerFeedback,
          reviewedAt: new Date().toISOString(),
          reviewedById: user?.id 
        } : null)
        setShowDecisionModal(false)
        setPendingDecision(null)
      }
    } catch (error) {
      console.error('Failed to submit decision:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      SUBMITTED: {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        darkColor: 'dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800',
        icon: Clock,
        label: 'Submitted'
      },
      UNDER_REVIEW: {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        darkColor: 'dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800',
        icon: Eye,
        label: 'Under Review'
      },
      SHORTLISTED: {
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        darkColor: 'dark:text-purple-400 dark:bg-purple-950 dark:border-purple-800',
        icon: Star,
        label: 'Shortlisted'
      },
      ACCEPTED: {
        color: 'text-green-600 bg-green-50 border-green-200',
        darkColor: 'dark:text-green-400 dark:bg-green-950 dark:border-green-800',
        icon: CheckCircle,
        label: 'Accepted'
      },
      REJECTED: {
        color: 'text-red-600 bg-red-50 border-red-200',
        darkColor: 'dark:text-red-400 dark:bg-red-950 dark:border-red-800',
        icon: XCircle,
        label: 'Rejected'
      }
    }
    return configs[status as keyof typeof configs] || configs.SUBMITTED
  }

  if (loading || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading application...</p>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(application.status)
  const StatusIcon = statusConfig.icon
  const applicantAge = application.user.dateOfBirth 
    ? differenceInYears(new Date(), new Date(application.user.dateOfBirth)) 
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/applications/${callId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applicants
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xl">
                  {application.user.firstName?.[0] || application.user.email[0].toUpperCase()}
                </span>
              </div>
              
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">
                    {application.user.firstName && application.user.lastName
                      ? `${application.user.firstName} ${application.user.lastName}`
                      : application.user.email
                    }
                  </h1>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border",
                    statusConfig.color,
                    statusConfig.darkColor
                  )}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{application.user.email}</span>
                  </div>
                  {application.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{application.user.phone}</span>
                    </div>
                  )}
                  {application.user.school && (
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4" />
                      <span>{application.user.school}</span>
                    </div>
                  )}
                  {application.user.county && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{application.user.county}</span>
                    </div>
                  )}
                  {applicantAge && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{applicantAge} years old</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {format(new Date(application.submittedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Content
              </h2>
              
              <div className="space-y-6">
                {Object.entries(application.formData).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-medium text-foreground mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-foreground whitespace-pre-wrap">{value as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Personal Information */}
            {(application.user.parentName || application.user.parentEmail) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent/Guardian Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.user.parentName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground">{application.user.parentName}</p>
                    </div>
                  )}
                  {application.user.parentEmail && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{application.user.parentEmail}</p>
                    </div>
                  )}
                  {application.user.parentPhone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground">{application.user.parentPhone}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {/* Scoring */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Review Score
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reviewer Feedback (Optional - sent to applicant)
                  </label>
                  <textarea
                    value={reviewerFeedback}
                    onChange={(e) => setReviewerFeedback(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Feedback that will be shared with the applicant..."
                  />
                </div>
                
                <button
                  onClick={handleSaveProgress}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Progress
                </button>
              </div>
            </motion.div>

            {/* Decision Buttons */}
            {application.status !== 'ACCEPTED' && application.status !== 'REJECTED' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border rounded-xl p-6"
              >
                <h3 className="font-semibold mb-4">Final Decision</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setPendingDecision('ACCEPTED')
                      setShowDecisionModal(true)
                    }}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </button>
                  
                  <button
                    onClick={() => {
                      setPendingDecision('SHORTLISTED')
                      setShowDecisionModal(true)
                    }}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Shortlist
                  </button>
                  
                  <button
                    onClick={() => {
                      setPendingDecision('REJECTED')
                      setShowDecisionModal(true)
                    }}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </motion.div>
            )}

            {/* Review Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border rounded-xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Review Notes
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <textarea
                    value={privateNote}
                    onChange={(e) => setPrivateNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                    placeholder="Add a private review note..."
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!privateNote.trim()}
                    className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reviewNotes.map((note) => (
                    <div key={note.id} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-foreground mb-2">{note.content}</p>
                      <div className="text-xs text-muted-foreground">
                        By {note.createdBy.firstName || 'Admin'} • {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      <AnimatePresence>
        {showDecisionModal && pendingDecision && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDecisionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                Confirm {pendingDecision === 'ACCEPTED' ? 'Acceptance' : 
                         pendingDecision === 'REJECTED' ? 'Rejection' : 'Shortlisting'}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {pendingDecision === 'ACCEPTED' 
                  ? 'This will accept the applicant and send them a notification email.'
                  : pendingDecision === 'REJECTED'
                  ? 'This will reject the applicant and send them a notification email.'
                  : 'This will shortlist the applicant for further review.'
                }
                {reviewerFeedback && ' Your feedback will be included in the notification.'}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDecisionModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFinalDecision(pendingDecision)}
                  disabled={saving}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg transition-colors text-white flex items-center justify-center gap-2 disabled:opacity-50",
                    pendingDecision === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' :
                    pendingDecision === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  )}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}