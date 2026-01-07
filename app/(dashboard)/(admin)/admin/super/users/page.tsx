'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronUp,
  ChevronDown,
  Calendar,
  Mail,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  Filter,
  UserPlus,
  Shield,
  Ban,
  Edit,
  Trash2,
  Save,
  X,
  User,
  School,
  Phone,
  MapPin,
  FileText,
  Clock,
  Activity,
  Award,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  school: string | null
  year: string | null
  role: string
  createdAt: string
  isActive: boolean
  isBanned: boolean
  emailVerified: boolean
  address?: string
  bio?: string
  cohortMemberships: any[]
  payments: any[]
  applications: any[]
  articles: any[]
  activityLogs: any[]
}

type SortField = 'name' | 'email' | 'school' | 'year' | 'role' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function UserManagementPage() {
  useEffect(() => {
    document.title = 'User Management | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Comprehensive user management system')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Comprehensive user management system'
      document.head.appendChild(meta)
    }
  }, [])

  const { user: currentUser, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [sessionError, setSessionError] = useState(false)
  
  // Check authentication and permissions
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (currentUser?.role !== 'SUPER_ADMIN') {
        router.push('/admin')
      }
    }
  }, [currentUser, isAuthenticated, isLoading, router])

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

  // Fetch all users
  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=1000&includePayments=true&includeCohorts=true&includeApplications=true&includeArticles=true&includeLogs=true', {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        setSessionError(true)
        await logout()
        router.push('/auth/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data?.users || [])
        setSessionError(false)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      // Mock data for development
      setUsers([
        {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+254700000001',
          school: 'Nairobi High School',
          year: 'Form 4',
          role: 'STUDENT',
          createdAt: '2024-01-15T10:00:00Z',
          isActive: true,
          isBanned: false,
          emailVerified: true,
          cohortMemberships: [],
          payments: [],
          applications: [],
          articles: [],
          activityLogs: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Dynamic extraction of unique values
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(users.map(u => u.year).filter(Boolean))) as string[]
  }, [users])

  const uniqueSchools = useMemo(() => {
    return Array.from(new Set(users.map(u => u.school).filter(Boolean))).sort() as string[]
  }, [users])

  // Real-time sorting and filtering
  const processedUsers = useMemo(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchLower = searchTerm.toLowerCase()
        return (
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.school?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    // Apply year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(user => user.year === filterYear)
    }

    // Apply school filter
    if (filterSchool !== 'all') {
      filtered = filtered.filter(user => user.school === filterSchool)
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'active':
          filtered = filtered.filter(user => user.isActive && !user.isBanned)
          break
        case 'inactive':
          filtered = filtered.filter(user => !user.isActive)
          break
        case 'banned':
          filtered = filtered.filter(user => user.isBanned)
          break
        case 'verified':
          filtered = filtered.filter(user => user.emailVerified)
          break
        case 'unverified':
          filtered = filtered.filter(user => !user.emailVerified)
          break
      }
    }

    // Sort users
    filtered.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortField) {
        case 'name':
          aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email
          bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email
          break
        case 'email':
          aVal = a.email
          bVal = b.email
          break
        case 'school':
          aVal = a.school || ''
          bVal = b.school || ''
          break
        case 'year':
          aVal = a.year || ''
          bVal = b.year || ''
          break
        case 'role':
          aVal = a.role
          bVal = b.role
          break
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        default:
          aVal = a[sortField]
          bVal = b[sortField]
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [users, searchTerm, sortField, sortDirection, filterRole, filterYear, filterSchool, filterStatus])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.isActive && !u.isBanned).length
    const verifiedUsers = users.filter(u => u.emailVerified).length
    const bannedUsers = users.filter(u => u.isBanned).length
    const roleBreakdown = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      bannedUsers,
      roleBreakdown
    }
  }, [users])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-30" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3" /> : 
      <ChevronDown className="h-3 w-3" />
  }

  const exportData = () => {
    const csv = [
      ['Email', 'Name', 'School', 'Year', 'Role', 'Status', 'Verified', 'Joined'],
      ...processedUsers.map(u => [
        u.email,
        `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        u.school || '',
        u.year || '',
        u.role,
        u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive',
        u.emailVerified ? 'Yes' : 'No',
        new Date(u.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show session error
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-destructive mb-4">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Session Expired</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Your session has expired. Please log in again to continue.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {isSuperAdmin ? 'Complete user administration' : 'User administration'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {isSuperAdmin && (
            <Link
              href="/admin/super/users/new"
              className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 text-sm sm:text-base hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
            </Link>
          )}
          <button
            onClick={() => fetchAllUsers()}
            className="px-3 sm:px-4 py-2 border border-border rounded-lg hover:bg-muted flex items-center gap-2 text-foreground text-sm sm:text-base transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="px-3 sm:px-4 py-2 border border-border rounded-lg hover:bg-muted flex items-center gap-2 text-foreground text-sm sm:text-base transition-colors"
            aria-label="Export to CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Active</p>
          <p className="text-2xl font-bold text-primary">{stats.activeUsers}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Verified</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.verifiedUsers}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Banned</p>
          <p className="text-2xl font-bold text-destructive">{stats.bannedUsers}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-label="Search users"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MENTOR">Mentor</option>
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
              <option value="USER">User</option>
            </select>

            {uniqueYears.length > 0 && (
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-label="Filter by year"
              >
                <option value="all">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}

            {uniqueSchools.length > 0 && (
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                aria-label="Filter by school"
              >
                <option value="all">All Schools</option>
                {uniqueSchools.slice(0, 50).map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
                {uniqueSchools.length > 50 && (
                  <option disabled>...and {uniqueSchools.length - 50} more</option>
                )}
              </select>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {processedUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-2 sm:p-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Name <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left p-2 sm:p-4 hidden sm:table-cell">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Email <SortIcon field="email" />
                  </button>
                </th>
                <th className="text-left p-2 sm:p-4 hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('school')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    School
                  </button>
                </th>
                <th className="text-left p-2 sm:p-4 hidden xl:table-cell">
                  <button
                    onClick={() => handleSort('year')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Year <SortIcon field="year" />
                  </button>
                </th>
                <th className="text-left p-2 sm:p-4">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Role <SortIcon field="role" />
                  </button>
                </th>
                <th className="text-left p-2 sm:p-4 hidden md:table-cell">Status</th>
                <th className="text-left p-2 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : processedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                processedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : user.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                        {user.cohortMemberships?.length > 0 && (
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {user.cohortMemberships.map((c: any) => c.cohort).filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm break-all hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm hidden lg:table-cell">
                      {user.school || '-'}
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm hidden xl:table-cell">
                      {user.year || '-'}
                    </td>
                    <td className="p-2 sm:p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                            <Ban className="h-3 w-3" />
                            Banned
                          </span>
                        ) : user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <UserCheck className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            <UserX className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                        {user.emailVerified && (
                          <Mail className="h-3 w-3 text-primary" aria-label="Email verified" />
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <Link
                        href={`/admin/super/users/${user.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm hover:opacity-90 transition-opacity"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}