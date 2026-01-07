'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Search, 
  Filter,
  GraduationCap,
  Mail,
  Phone,
  School,
  Award,
  TrendingUp,
  Calendar,
  ChevronRight,
  Eye
} from 'lucide-react'

interface Student {
  id: string
  slug: string
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  school?: string | null
  cohort: string
  joinedAt: string
  assignedAt: string
  articlesWritten: number
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED'
  lastLogin?: string | null
}

export default function MentorStudentsPage() {
  
  useEffect(() => {
    document.title = 'My Students | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View and manage your assigned students')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'View and manage your assigned students'
      document.head.appendChild(meta)
    }
  }, [])


  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCohort, setFilterCohort] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/mentor/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.data?.students || [])
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim()
    const matchesSearch = searchTerm === '' ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.school?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesCohort = filterCohort === 'all' || student.cohort === filterCohort
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus

    return matchesSearch && matchesCohort && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800'
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeAgo = (date?: string | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const past = new Date(date)
    const diff = now.getTime() - past.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    return past.toLocaleDateString()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Students</h1>
        <p className="text-muted-foreground">
          Manage and track your cohort students' progress
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <select
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Cohorts</option>
            <option value="2024">2024 Cohort</option>
            <option value="2023">2023 Cohort</option>
            <option value="2022">2022 Cohort</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="GRADUATED">Graduated</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No students found</p>
          </div>
        ) : (
          filteredStudents.map(student => {
            const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student'
            
            return (
              <div key={student.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold">{fullName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                        {student.status.toLowerCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Cohort {student.cohort}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.school && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <School className="h-4 w-4" />
                          <span>{student.school}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Articles Written: </span>
                        <span className="font-medium">{student.articlesWritten || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Login: </span>
                        <span className="font-medium">{getTimeAgo(student.lastLogin)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Joined: </span>
                        <span className="font-medium">
                          {new Date(student.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned: </span>
                        <span className="font-medium">
                          {new Date(student.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/mentor/students/${student.slug || student.id}`}
                    className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
