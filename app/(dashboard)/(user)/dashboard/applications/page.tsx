'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Search,
  Rocket,
  XCircle,
  Star,
  Award
} from 'lucide-react'
import { format, differenceInDays, isAfter } from 'date-fns'
import { showError, showInfo } from '@/app/lib/hooks/useFlashNotification'

interface ApplicationForm {
  id: string
  season: string
  title: string
  description?: string
  openDate: string
  closeDate: string
  isActive: boolean
}

interface Application {
  id: string
  formId: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  season: string
  createdAt: string
  submittedAt: string | null
  reviewedAt: string | null
  updatedAt: string
  data?: any
}

const statusConfig = {
  DRAFT: {
    icon: Edit,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700',
    label: 'Draft',
    description: 'Application in progress'
  },
  SUBMITTED: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    label: 'Submitted',
    description: 'Under review'
  },
  UNDER_REVIEW: {
    icon: Eye,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
    label: 'Under Review',
    description: 'Being evaluated'
  },
  SHORTLISTED: {
    icon: Star,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
    label: 'Shortlisted',
    description: 'Selected for next round'
  },
  ACCEPTED: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    label: 'Accepted',
    description: 'Congratulations!'
  },
  REJECTED: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
    label: 'Rejected',
    description: 'Application rejected'
  }
}

export default function MyApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [activeForm, setActiveForm] = useState<ApplicationForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    document.title = 'My Applications | FIRST Global Team Kenya'
    fetchActiveForm()
    fetchMyApplications()
  }, [])

  const fetchActiveForm = async () => {
    try {
      const response = await fetch('/api/applications/forms/active', {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        if (data.data?.form) {
          setActiveForm(data.data.form)
        }
      }
    } catch (error) {
      console.error('Failed to fetch active form:', error)
    }
  }

  const fetchMyApplications = async () => {
    try {
      const response = await fetch('/api/applications/my-applications', {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data?.applications || [])
      } else {
        // Mock data for development
        setApplications([
          {
            id: '1',
            formId: 'form1',
            status: 'SUBMITTED',
            season: 'FGC2025',
            createdAt: '2024-01-15T10:00:00Z',
            submittedAt: '2024-01-20T14:30:00Z',
            reviewedAt: null,
            updatedAt: '2024-01-20T14:30:00Z'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      showError('Failed to load your applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
  }

  const getDaysRemaining = (closeDate: string) => {
    const days = differenceInDays(new Date(closeDate), new Date())
    if (days < 0) return 'Closed'
    if (days === 0) return 'Closes today'
    if (days === 1) return '1 day left'
    if (days <= 7) return `${days} days left`
    return `${Math.floor(days / 7)} weeks left`
  }

  const canApply = () => {
    if (!activeForm) return false
    const hasExistingApplication = applications.some(
      app => app.season === activeForm.season
    )
    return !hasExistingApplication
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesSearch = searchTerm === '' ||
      app.season.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Statistics
  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status !== 'DRAFT').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    pending: applications.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length
  }

  if (loading) {
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary via-primary to-green-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Applications</h1>
              <p className="text-white/90">
                Track your journey to join Team Kenya for FIRST Global
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Applications</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.submitted}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Submitted</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">In Review</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.accepted}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Accepted</p>
          </motion.div>
        </div>

        {/* Active Application Form Banner */}
        {activeForm && canApply() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Applications Open
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {getDaysRemaining(activeForm.closeDate)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">{activeForm.title}</h2>
                <p className="text-sm text-muted-foreground">{activeForm.description}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/join"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Apply Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All Status</option>
            {Object.keys(statusConfig).map(status => (
              <option key={status} value={status}>
                {statusConfig[status as keyof typeof statusConfig].label}
              </option>
            ))}
          </select>
        </div>

        {/* Applications List */}
        <AnimatePresence>
          {filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-xl p-12 text-center"
            >
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {applications.length === 0
                  ? "Start your journey with Team Kenya by applying today!"
                  : "Try adjusting your filters to see more results."}
              </p>
              {activeForm && canApply() && (
                <Link 
                  href="/join" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Start Your Application
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application, index) => {
                const statusInfo = getStatusInfo(application.status)
                const StatusIcon = statusInfo.icon

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            Application for {application.season}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.bgColor} ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {statusInfo.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {format(new Date(application.createdAt), 'MMM d, yyyy')}
                          </div>
                          {application.submittedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Submitted {format(new Date(application.submittedAt), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {application.status === 'DRAFT' && (
                          <Link
                            href={`/dashboard/applications/apply?edit=${application.id}`}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="hidden sm:inline">Continue</span>
                          </Link>
                        )}
                        <Link
                          href={`/dashboard/applications/${application.id}`}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all inline-flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}