'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

import {
  User,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Award,
  Target,
  BookOpen
} from 'lucide-react'

interface Application {
  id: string
  status: string
  season: string
  createdAt: string
  submittedAt: string | null
  reviewedAt: string | null
}

interface UserStats {
  totalApplications: number
  submittedApplications: number
  activeApplications: number
}

const statusConfig = {
  DRAFT: {
    icon: Edit,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    label: 'Draft',
    description: 'Application in progress'
  },
  SUBMITTED: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Submitted',
    description: 'Under review'
  },
  UNDER_REVIEW: {
    icon: Eye,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Under Review',
    description: 'Being evaluated'
  },
  SHORTLISTED: {
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    label: 'Shortlisted',
    description: 'Advanced to next round'
  },
  INTERVIEW_SCHEDULED: {
    icon: Calendar,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    label: 'Interview Scheduled',
    description: 'Interview arranged'
  },
  INTERVIEWED: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    label: 'Interviewed',
    description: 'Interview completed'
  },
  ACCEPTED: {
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    label: 'Accepted',
    description: 'Congratulations!'
  },
  REJECTED: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    label: 'Not Selected',
    description: 'Application not successful'
  },
  WAITLISTED: {
    icon: Clock,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    label: 'Waitlisted',
    description: 'On waiting list'
  },
  WITHDRAWN: {
    icon: AlertCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    label: 'Withdrawn',
    description: 'Application withdrawn'
  }
}

export default function DashboardPage() {
  
  useEffect(() => {
    document.title = 'Dashboard | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Welcome to your FIRST Global Kenya dashboard')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Welcome to your FIRST Global Kenya dashboard'
      document.head.appendChild(meta)
    }
  }, [])


  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/applications/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your application overview.</p>
          </div>

          <Link
            href="/join"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Application
          </Link>
        </div>

        {/* Applications List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Applications</h2>
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground">
                {applications.length} application{applications.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your journey by creating your first application for the 2026 season.
              </p>
              <Link href="/join" className="btn-primary">
                Create Application
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => {
                const statusInfo = getStatusInfo(application.status)
                const StatusIcon = statusInfo.icon

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                        <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                      </div>

                      <div>
                        <h3 className="font-medium">
                          {application.season} Season Application
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {statusInfo.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                          {application.submittedAt && (
                            <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>

                      <Link
                        href={`/applications/${application.id}`}
                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Resources & Guides
            </h3>
            <p className="text-muted-foreground mb-4">
              Access learning materials, preparation guides, and tips for your application.
            </p>
            <Link href="/resources" className="text-primary hover:text-primary/80 font-medium">
              Explore Resources →
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Past Competitions
            </h3>
            <p className="text-muted-foreground mb-4">
              Learn from our previous competitions and see what makes a winning team.
            </p>
            <Link href="/about" className="text-primary hover:text-primary/80 font-medium">
              View History →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
