'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Star,
  Mail,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Archive,
  RefreshCw,
  Settings,
  Hammer
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const ApplicationFormBuilder = dynamic(
  () => import('@/app/components/admin/ApplicationFormBuilder'),
  { ssr: false }
)

interface ApplicationCall {
  id: string
  title: string
  year: string
  status: 'draft' | 'active' | 'closed' | 'archived'
  openDate: string
  closeDate: string
  description: string
  maxApplications?: number
  currentApplications: number
  shortlistedCount: number
  acceptedCount: number
  rejectedCount: number
  createdAt: string
  updatedAt: string
  createdBy: {
    email: string
    firstName?: string
    lastName?: string
  }
}

interface ApplicationSummary {
  total: number
  submitted: number
  underReview: number
  shortlisted: number
  accepted: number
  rejected: number
}

export default function ApplicationsManagementPage() {
  useEffect(() => {
    document.title = 'Applications Management | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage application calls and review applicants')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Manage application calls and review applicants'
      document.head.appendChild(meta)
    }
  }, [])

  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [applicationCalls, setApplicationCalls] = useState<ApplicationCall[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCall, setEditingCall] = useState<ApplicationCall | null>(null)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState<any>(null)

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    fetchApplicationCalls()
  }, [])

  const fetchApplicationCalls = async () => {
    try {
      const response = await fetch('/api/admin/applications/calls', {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        const calls = data.data?.calls || []
        setApplicationCalls(calls)
        
        // Find the active call
        const active = calls.find((c: ApplicationCall) => c.status === 'active')
        if (active) {
          setActiveCallId(active.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch application calls:', error)
      // Mock data for development
      const mockCalls: ApplicationCall[] = [
        {
          id: '1',
          title: 'FIRST Global Challenge 2025',
          year: '2025',
          status: 'active',
          openDate: '2025-01-01T00:00:00Z',
          closeDate: '2025-03-31T23:59:59Z',
          description: 'Application for the 2025 FIRST Global Challenge robotics competition',
          maxApplications: 200,
          currentApplications: 45,
          shortlistedCount: 0,
          acceptedCount: 0,
          rejectedCount: 0,
          createdAt: '2024-12-01T00:00:00Z',
          updatedAt: '2024-12-01T00:00:00Z',
          createdBy: {
            email: 'admin@fgc.ke',
            firstName: 'Admin'
          }
        },
        {
          id: '2',
          title: 'FIRST Global Challenge 2024',
          year: '2024',
          status: 'closed',
          openDate: '2024-01-01T00:00:00Z',
          closeDate: '2024-03-31T23:59:59Z',
          description: 'Application for the 2024 FIRST Global Challenge robotics competition',
          currentApplications: 150,
          shortlistedCount: 30,
          acceptedCount: 10,
          rejectedCount: 140,
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2024-04-01T00:00:00Z',
          createdBy: {
            email: 'admin@fgc.ke'
          }
        }
      ]
      setApplicationCalls(mockCalls)
      setActiveCallId('1')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateCall = async (callId: string) => {
    if (!confirm('Activating this call will deactivate all other calls. Continue?')) return

    try {
      const response = await fetch(`/api/admin/applications/calls/${callId}/activate`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setActiveCallId(callId)
        fetchApplicationCalls()
      }
    } catch (error) {
      console.error('Failed to activate call:', error)
    }
  }

  const handleDuplicateCall = async (call: ApplicationCall) => {
    const nextYear = (parseInt(call.year) + 1).toString()
    const { id, ...callWithoutId } = call
    const duplicated = {
      ...callWithoutId,
      id: '',
      title: call.title.replace(call.year, nextYear),
      year: nextYear,
      status: 'draft' as const,
      currentApplications: 0,
      shortlistedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0
    }
    setEditingCall(duplicated as ApplicationCall)
    setShowCreateModal(true)
  }

  const handleDeleteCall = async (callId: string) => {
    if (!confirm('Are you sure you want to delete this application call? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/applications/calls/${callId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchApplicationCalls()
      }
    } catch (error) {
      console.error('Failed to delete call:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'draft':
        return 'bg-muted text-muted-foreground border-border'
      case 'closed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'archived':
        return 'bg-muted/50 text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ToggleRight className="h-4 w-4" />
      case 'draft':
        return <Edit className="h-4 w-4" />
      case 'closed':
        return <XCircle className="h-4 w-4" />
      case 'archived':
        return <Archive className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Get unique years for filter
  const uniqueYears = Array.from(new Set(applicationCalls.map(c => c.year))).sort((a, b) => b.localeCompare(a))

  // Filter application calls
  const filteredCalls = applicationCalls.filter(call => {
    const matchesSearch = searchTerm === '' || 
      call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.year.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter
    const matchesYear = yearFilter === 'all' || call.year === yearFilter
    
    return matchesSearch && matchesStatus && matchesYear
  })

  // Sort by year (newest first), then by status (active first)
  const sortedCalls = [...filteredCalls].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year.localeCompare(a.year)
    }
    if (a.status === 'active') return -1
    if (b.status === 'active') return 1
    return 0
  })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Applications Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage application calls and review applicants</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingForm(null)
              setShowFormBuilder(true)
            }}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Hammer className="h-4 w-4" />
            Form Builder
          </button>
          
          <button
            onClick={() => {
              setEditingCall(null)
              setShowCreateModal(true)
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Application Call
          </button>
        </div>
      </div>

      {/* Active Call Alert */}
      {activeCallId && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                Active Application: {applicationCalls.find(c => c.id === activeCallId)?.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Currently accepting applications from students
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search application calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={fetchApplicationCalls}
              className="px-3 py-2 border border-border rounded-lg hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Application Calls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedCalls.length === 0 ? (
          <div className="col-span-full bg-card rounded-lg border border-border p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No application calls found</p>
            <button
              onClick={() => {
                setEditingCall(null)
                setShowCreateModal(true)
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Create First Application Call
            </button>
          </div>
        ) : (
          sortedCalls.map((call) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card rounded-lg border p-6 ${
                call.id === activeCallId ? 'ring-2 ring-primary border-primary' : 'border-border'
              }`}
            >
              {/* Call Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{call.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Year: {call.year}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                  {getStatusIcon(call.status)}
                  {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {call.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Applications</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {call.currentApplications}
                    {call.maxApplications && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {' '}/ {call.maxApplications}
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Period</span>
                  </div>
                  <p className="text-xs text-foreground">
                    {new Date(call.openDate).toLocaleDateString()} - {new Date(call.closeDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Application Status Breakdown */}
              {call.currentApplications > 0 && (
                <div className="flex items-center gap-4 mb-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {call.shortlistedCount} Shortlisted
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {call.acceptedCount} Accepted
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    {call.rejectedCount} Rejected
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/applications/${call.id}`}
                  className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Applicants
                </Link>
                
                <button
                  onClick={() => handleDuplicateCall(call)}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                  title="Duplicate for next year"
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                {call.status === 'draft' && (
                  <>
                    <button
                      onClick={() => {
                        setEditingCall(call)
                        setShowCreateModal(true)
                      }}
                      className="px-3 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleActivateCall(call.id)}
                      className="px-3 py-2 border border-border rounded-lg hover:bg-muted text-primary transition-colors"
                      title="Activate this call"
                    >
                      <ToggleRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                
                {call.status === 'draft' && call.currentApplications === 0 && (
                  <button
                    onClick={() => handleDeleteCall(call.id)}
                    className="px-3 py-2 border border-border rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-foreground">
                {editingCall ? 'Edit Application Call' : 'Create New Application Call'}
              </h2>
              
              {/* Form content will go here */}
              <div className="space-y-4">
                <p className="text-muted-foreground">Form implementation coming soon...</p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save logic here
                    setShowCreateModal(false)
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingCall ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Builder Modal */}
      {showFormBuilder && (
        <div className="fixed inset-0 z-50 bg-background">
          <ApplicationFormBuilder
            initialData={editingForm}
            onSave={async (formData) => {
              try {
                const url = editingForm 
                  ? `/api/applications/forms/${editingForm.id}`
                  : '/api/applications/forms'
                
                const response = await fetch(url, {
                  method: editingForm ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(formData)
                })
                
                if (response.ok) {
                  setShowFormBuilder(false)
                  setEditingForm(null)
                  fetchApplicationCalls()
                  
                  // Show success message
                  const message = editingForm 
                    ? 'Application form updated successfully'
                    : 'Application form created successfully'
                  
                  // You can add a toast notification here
                  console.log(message)
                } else {
                  throw new Error('Failed to save form')
                }
              } catch (error) {
                console.error('Error saving form:', error)
                // You can add error handling/toast here
              }
            }}
            onCancel={() => {
              setShowFormBuilder(false)
              setEditingForm(null)
            }}
          />
        </div>
      )}
    </div>
  )
}