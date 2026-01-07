'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Download,
  Eye,
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
  TrendingUp,
  UserCheck,
  UserX,
  UserPlus
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { cn } from '@/app/lib/utils'
import { format, differenceInDays } from 'date-fns'

interface Application {
  id: string
  userId: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  submittedAt: string
  reviewedAt?: string
  reviewedById?: string
  score?: number
  notes?: string
  formData: Record<string, any>
  user: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    school?: string
    county?: string
    dateOfBirth?: string
  }
  reviewedBy?: {
    firstName?: string
    lastName?: string
    email: string
  }
}

interface ApplicationCall {
  id: string
  title: string
  year: string
  status: string
  openDate: string
  closeDate: string
  description: string
  maxApplications?: number
  currentApplications: number
  shortlistedCount: number
  acceptedCount: number
  rejectedCount: number
}

export default function ApplicationCallDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const callId = params.slug as string

  const [applications, setApplications] = useState<Application[]>([])
  const [applicationCall, setApplicationCall] = useState<ApplicationCall | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name' | 'score'>('latest')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (callId) {
      fetchApplicationCall()
      fetchApplications()
    }
  }, [callId])

  useEffect(() => {
    if (applicationCall) {
      document.title = `${applicationCall.title} - Applicants | FIRST Global Team Kenya`
    }
  }, [applicationCall])

  const fetchApplicationCall = async () => {
    try {
      const response = await fetch(`/api/admin/applications/calls/${callId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplicationCall(data.data.call)
      }
    } catch (error) {
      console.error('Failed to fetch application call:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/admin/applications/calls/${callId}/applications`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data.applications || [])
      } else {
        // Mock data for development
        const mockApplications: Application[] = [
          {
            id: '1',
            userId: 'user1',
            status: 'SUBMITTED',
            submittedAt: '2025-01-01T10:30:00Z',
            score: 85,
            formData: {
              motivation: 'Passionate about robotics and STEM education...',
              experience: '2 years in robotics club, participated in local competitions...'
            },
            user: {
              email: 'jane.doe@example.com',
              firstName: 'Jane',
              lastName: 'Doe',
              phone: '+254700000001',
              school: 'Nairobi Academy',
              county: 'Nairobi',
              dateOfBirth: '2007-03-15'
            }
          },
          {
            id: '2',
            userId: 'user2',
            status: 'SHORTLISTED',
            submittedAt: '2025-01-02T14:20:00Z',
            reviewedAt: '2025-01-03T09:15:00Z',
            score: 92,
            notes: 'Excellent technical background and strong leadership potential.',
            formData: {
              motivation: 'Leading robotics initiatives at school...',
              experience: 'Team captain, won regional competitions...'
            },
            user: {
              email: 'john.smith@example.com',
              firstName: 'John',
              lastName: 'Smith',
              phone: '+254700000002',
              school: 'Mombasa High School',
              county: 'Mombasa',
              dateOfBirth: '2006-08-22'
            },
            reviewedBy: {
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@fgc.ke'
            }
          }
        ]
        setApplications(mockApplications)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
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

  // Filter and sort applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.school?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      case 'oldest':
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      case 'name':
        const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
        const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      case 'score':
        return (b.score || 0) - (a.score || 0)
      default:
        return 0
    }
  })

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'SUBMITTED').length,
    underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length
  }

  if (loading || !applicationCall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/applications"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{applicationCall.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {applicationCall.year}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {differenceInDays(new Date(applicationCall.closeDate), new Date()) > 0 
                    ? `${differenceInDays(new Date(applicationCall.closeDate), new Date())} days left`
                    : 'Closed'
                  }
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {applicationCall.currentApplications} applications
                </span>
              </div>
              <p className="text-muted-foreground mt-2">{applicationCall.description}</p>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            <p className="text-xs text-blue-600">Submitted</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
            <p className="text-xs text-yellow-600">Reviewing</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-purple-600">{stats.shortlisted}</p>
            <p className="text-xs text-purple-600">Shortlisted</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-xs text-green-600">Accepted</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-red-600">Rejected</p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-card border rounded-xl p-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="score">Score High-Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Applications List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredApplications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border rounded-xl p-12 text-center"
              >
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No applications match your current filters.'
                    : 'No applications have been submitted for this call yet.'
                  }
                </p>
              </motion.div>
            ) : (
              filteredApplications.map((application, index) => {
                const statusConfig = getStatusConfig(application.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/applications/${callId}/applicants/${application.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold">
                            {application.user.firstName?.[0] || application.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {application.user.firstName && application.user.lastName
                                ? `${application.user.firstName} ${application.user.lastName}`
                                : application.user.email
                              }
                            </h3>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                              statusConfig.color,
                              statusConfig.darkColor
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                            {application.score && (
                              <span className="bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium">
                                Score: {application.score}/100
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{application.user.email}</span>
                            </div>
                            {application.user.school && (
                              <div className="flex items-center gap-1">
                                <School className="h-3 w-3" />
                                <span className="truncate">{application.user.school}</span>
                              </div>
                            )}
                            {application.user.county && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{application.user.county}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Submitted {format(new Date(application.submittedAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          
                          {application.reviewedBy && application.reviewedAt && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Reviewed by {application.reviewedBy.firstName || 'Admin'} on{' '}
                              {format(new Date(application.reviewedAt), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/admin/applications/${callId}/applicants/${application.id}`)
                          }}
                          className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Review</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}