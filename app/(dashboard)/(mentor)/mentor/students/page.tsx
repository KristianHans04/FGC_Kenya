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
  name: string
  email: string
  phone: string
  school: string
  cohort: string
  joinedAt: string
  progress: number
  modules: {
    completed: number
    total: number
  }
  achievements: number
  lastActive: string
  status: 'active' | 'inactive' | 'graduated'
}

export default function MentorStudentsPage() {
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

  // Mock data for display
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@school.edu',
      phone: '+254 700 123456',
      school: 'Nairobi Academy',
      cohort: '2024',
      joinedAt: '2024-01-15',
      progress: 75,
      modules: { completed: 9, total: 12 },
      achievements: 5,
      lastActive: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'James Mwangi',
      email: 'james.m@school.edu',
      phone: '+254 722 654321',
      school: 'Kisumu Technical',
      cohort: '2024',
      joinedAt: '2024-01-20',
      progress: 60,
      modules: { completed: 7, total: 12 },
      achievements: 3,
      lastActive: '1 day ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Mary Wanjiru',
      email: 'mary.w@school.edu',
      phone: '+254 733 789012',
      school: 'Mombasa High',
      cohort: '2023',
      joinedAt: '2023-03-10',
      progress: 100,
      modules: { completed: 12, total: 12 },
      achievements: 8,
      lastActive: '1 week ago',
      status: 'graduated'
    }
  ]

  const displayStudents = students.length > 0 ? students : mockStudents

  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch = searchTerm === '' ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCohort = filterCohort === 'all' || student.cohort === filterCohort
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus

    return matchesSearch && matchesCohort && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'graduated':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Students</h1>
        <p className="text-muted-foreground">
          Manage and track your cohort students' progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Students</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{filteredStudents.length}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Across all cohorts
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Students</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {filteredStudents.filter(s => s.status === 'active').length}
          </div>
          <div className="text-sm text-green-600 mt-2">Currently engaged</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Graduated</span>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {filteredStudents.filter(s => s.status === 'graduated').length}
          </div>
          <div className="text-sm text-blue-600 mt-2">Completed program</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Progress</span>
            <Award className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {Math.round(
              filteredStudents.reduce((acc, s) => acc + s.progress, 0) / 
              (filteredStudents.length || 1)
            )}%
          </div>
          <div className="text-sm text-muted-foreground mt-2">Course completion</div>
        </div>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
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
          filteredStudents.map(student => (
            <div key={student.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                      {student.status}
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <School className="h-4 w-4" />
                      <span>{student.school}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Modules: </span>
                      <span className="font-medium">
                        {student.modules.completed}/{student.modules.total} completed
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Achievements: </span>
                      <span className="font-medium">{student.achievements} earned</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Active: </span>
                      <span className="font-medium">{student.lastActive}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Joined: </span>
                      <span className="font-medium">
                        {new Date(student.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/mentor/students/${student.id}`}
                  className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
