/**
 * @file app/(dashboard)/(user)/dashboard/applications/page.tsx
 * @description User applications page with program differentiation
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react'
import { PROGRAMS, APPLICATION_STATUSES } from '@/app/lib/constants'

interface Application {
  id: string
  status: string
  season: string
  program: string
  createdAt: string
  submittedAt: string | null
  reviewedAt: string | null
  updatedAt: string
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
  REVIEWED: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    label: 'Reviewed',
    description: 'Review completed'
  },
  REJECTED: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    label: 'Rejected',
    description: 'Application rejected'
  }
}

const programs = Object.values(PROGRAMS)

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/applications/my')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      // Mock data for development
      setApplications([
        {
          id: '1',
          status: 'SUBMITTED',
          season: '2026',
          program: 'fgc-2026',
          createdAt: '2024-01-15T10:00:00Z',
          submittedAt: '2024-01-20T14:30:00Z',
          reviewedAt: null,
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          status: 'DRAFT',
          season: '2027',
          program: 'fgc-2027',
          createdAt: '2024-02-01T09:00:00Z',
          submittedAt: null,
          reviewedAt: null,
          updatedAt: '2024-02-01T09:00:00Z'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
  }

  const getProgramInfo = (programId: string) => {
    return programs.find(p => p.id === programId) || { name: 'Unknown Program', description: '' }
  }

  const filteredApplications = applications.filter(app => {
    const matchesProgram = selectedProgram === 'all' || app.program === selectedProgram
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesSearch = searchTerm === '' ||
      app.season.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProgramInfo(app.program).name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesProgram && matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Applications</h1>
          <p className="text-muted-foreground">Manage your applications across different programs</p>
        </div>

        <Link
          href="/join"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
          >
            <option value="all">All Programs</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>{program.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground mb-4">
              {applications.length === 0
                ? "You haven't started any applications yet."
                : "No applications match your current filters."}
            </p>
            <Link href="/join" className="btn-primary">
              Start Your First Application
            </Link>
          </div>
        ) : (
          filteredApplications.map((application, index) => {
            const statusInfo = getStatusInfo(application.status)
            const programInfo = getProgramInfo(application.program)
            const StatusIcon = statusInfo.icon

            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{programInfo.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-3">{programInfo.description}</p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                      {application.submittedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Submitted {new Date(application.submittedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {application.status === 'DRAFT' && (
                      <Link
                        href={`/join?edit=${application.id}`}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/applications/${application.id}`}
                      className="btn-outline flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}