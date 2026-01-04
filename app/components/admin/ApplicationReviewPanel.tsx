'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  User
} from 'lucide-react'

interface Application {
  id: string
  status: string
  progress: number
  responses: any
  submittedAt: string | null
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    school?: string
  }
  form: {
    id: string
    season: string
    title: string
  }
  reviewedBy?: {
    email: string
    firstName: string
    lastName: string
  }
  reviewedAt?: string
  reviewNotes?: string
}

interface ApplicationReviewPanelProps {
  formId: string
}

export default function ApplicationReviewPanel({ formId }: ApplicationReviewPanelProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  
  const itemsPerPage = 10

  useEffect(() => {
    fetchApplications()
  }, [formId, filter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        formId,
        ...(filter !== 'all' && { status: filter })
      })
      
      const response = await fetch(`/api/admin/applications?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setApplications(data.data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reviewNotes
        })
      })

      const data = await response.json()
      if (data.success) {
        await fetchApplications()
        setSelectedApplication(null)
        setReviewNotes('')
        alert(`Application ${status.toLowerCase()} successfully`)
      }
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Failed to update application status')
    } finally {
      setIsUpdating(false)
    }
  }

  const exportApplications = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/applications/export?formId=${formId}&format=${format}`)
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `applications-export.csv`
        a.click()
      } else {
        const data = await response.json()
        if (data.success) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `applications-export.json`
          a.click()
        }
      }
    } catch (error) {
      console.error('Error exporting applications:', error)
      alert('Failed to export applications')
    }
  }

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        app.user.firstName.toLowerCase().includes(searchLower) ||
        app.user.lastName.toLowerCase().includes(searchLower) ||
        app.user.email.toLowerCase().includes(searchLower) ||
        (app.user.school && app.user.school.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SUBMITTED: 'bg-blue-100 text-blue-700',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      WAITLISTED: 'bg-purple-100 text-purple-700'
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const renderDocumentLinks = (responses: any) => {
    const linkFields = []
    for (const key in responses) {
      const value = responses[key]
      if (typeof value === 'string' && value.startsWith('http')) {
        linkFields.push({ key, url: value })
      }
    }
    
    if (linkFields.length === 0) return null

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Document Links
        </h4>
        <div className="space-y-2">
          {linkFields.map(({ key, url }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline truncate"
            >
              {key}: {url}
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            All ({applications.length})
          </button>
          <button
            onClick={() => setFilter('SUBMITTED')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'SUBMITTED' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setFilter('UNDER_REVIEW')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'UNDER_REVIEW' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'APPROVED' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Approved
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => exportApplications('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => exportApplications('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, email, or school..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedApplications.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {app.user.firstName} {app.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{app.user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app.user.school || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${app.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{app.progress}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Not submitted'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Application Review</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Applicant Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <p className="font-medium">
                      {selectedApplication.user.firstName} {selectedApplication.user.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedApplication.user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedApplication.user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">School:</span>
                    <p className="font-medium">{selectedApplication.user.school || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Data
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedApplication.responses, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Document Links */}
              {renderDocumentLinks(selectedApplication.responses)}

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add review notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'WAITLISTED')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  Waitlist
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'APPROVED')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}