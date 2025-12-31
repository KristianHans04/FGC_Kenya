/**
 * Admin Applications Management Page with Review Workflow
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Star,
  Mail,
  MessageSquare,
  ChevronRight,
  Users,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  season: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  submittedAt: string
  createdAt: string
  reviewNotes?: string
  rejectionFeedback?: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    school?: string
    year?: string
    phone?: string
  }
  responses: Record<string, any>
  reviewer?: {
    email: string
    firstName?: string
    lastName?: string
  }
  reviewedAt?: string
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/admin/applications?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data?.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    SHORTLISTED: 'bg-purple-100 text-purple-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Applications Management</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-card rounded-lg shadow">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4">Applicant</th>
              <th className="text-left p-4">Season</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Submitted</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8">Loading...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8">No applications found</td>
              </tr>
            ) : (
              applications.map((app: any) => (
                <tr key={app.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{app.user?.firstName} {app.user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{app.user?.email}</p>
                    </div>
                  </td>
                  <td className="p-4">{app.season}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-muted rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}