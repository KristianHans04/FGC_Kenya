'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Calendar,
  School,
  Mail,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'

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
  lastLoginAt: string | null
  isActive: boolean
  emailVerified: boolean
  cohortMemberships: any[]
  payments: any[]
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  type: string
  createdAt: string
  user: {
    email: string
    firstName: string | null
    lastName: string | null
  }
}

type SortField = 'name' | 'email' | 'school' | 'year' | 'role' | 'createdAt' | 'lastLoginAt'
type SortDirection = 'asc' | 'desc'

export default function SuperAdminDashboard() {
  
  useEffect(() => {
    document.title = 'Super Admin Panel | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Advanced system administration tools')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Advanced system administration tools'
      document.head.appendChild(meta)
    }
  }, [])


  const { user } = useAuth()
  const router = useRouter()
  
  // Verify super admin access
  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/admin')
    }
  }, [user, router])

  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch all users instantly (no pagination for super admin)
  useEffect(() => {
    fetchAllUsers()
    fetchPayments()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=1000&includePayments=true&includeCohorts=true')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data?.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data?.payments || [])
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

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
          user.school?.toLowerCase().includes(searchLower)
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
        case 'lastLoginAt':
          aVal = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
          bVal = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
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
  }, [users, searchTerm, sortField, sortDirection, filterRole, filterYear, filterSchool])

  // Get unique values for filters
  const uniqueYears = Array.from(new Set(users.map(u => u.year).filter(Boolean))) as string[]
  const uniqueSchools = Array.from(new Set(users.map(u => u.school).filter(Boolean))) as string[]

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
    const activeUsers = users.filter(u => u.isActive).length
    const verifiedUsers = users.filter(u => u.emailVerified).length
    const recentLogins = users.filter(u => {
      if (!u.lastLoginAt) return false
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(u.lastLoginAt) > dayAgo
    }).length

    return {
      totalUsers: users.length,
      activeUsers,
      verifiedUsers,
      recentLogins,
      totalPayments,
      paymentCount: payments.length
    }
  }, [users, payments])

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
      ['Email', 'Name', 'School', 'Year', 'Role', 'Status', 'Joined', 'Last Login'],
      ...processedUsers.map(u => [
        u.email,
        `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        u.school || '',
        u.year || '',
        u.role,
        u.isActive ? 'Active' : 'Inactive',
        new Date(u.createdAt).toLocaleDateString(),
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Complete system oversight and control</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => fetchAllUsers()}
            className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground">Users</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
          <p className="text-xs text-muted-foreground">Active Users</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Mail className="h-5 w-5 text-purple-500" />
            <span className="text-xs text-muted-foreground">Verified</span>
          </div>
          <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-xs text-muted-foreground">24h</span>
          </div>
          <p className="text-2xl font-bold">{stats.recentLogins}</p>
          <p className="text-xs text-muted-foreground">Recent Logins</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Payments</span>
          </div>
          <p className="text-2xl font-bold">{stats.paymentCount}</p>
          <p className="text-xs text-muted-foreground">Transactions</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">
            ${(stats.totalPayments / 100).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Revenue</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card p-4 rounded-lg border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, email, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="MENTOR">Mentor</option>
              <option value="STUDENT">Student</option>
              <option value="ALUMNI">Alumni</option>
              <option value="USER">User</option>
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Schools</option>
              {uniqueSchools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {processedUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Name <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Email <SortIcon field="email" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('school')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    School <SortIcon field="school" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('year')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Year <SortIcon field="year" />
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Role <SortIcon field="role" />
                  </button>
                </th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort('lastLoginAt')}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    Last Login <SortIcon field="lastLoginAt" />
                  </button>
                </th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      Loading all users...
                    </div>
                  </td>
                </tr>
              ) : processedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                processedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : user.email.split('@')[0]}
                        </p>
                        {user.cohortMemberships?.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {user.cohortMemberships.map((c: any) => c.cohort).filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">{user.email}</td>
                    <td className="p-4 text-sm">{user.school || '-'}</td>
                    <td className="p-4 text-sm">{user.year || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'MENTOR' ? 'bg-green-100 text-green-800' :
                          user.role === 'STUDENT' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'ALUMNI' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.emailVerified && (
                          <Mail className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">User Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedUser.firstName || selectedUser.lastName
                        ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium">{selectedUser.school || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{selectedUser.year || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedUser.role}</p>
                  </div>
                </div>

                {/* Role History Timeline */}
                {selectedUser.cohortMemberships?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Role History</h3>
                    <div className="space-y-2">
                      {selectedUser.cohortMemberships.map((membership: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>{membership.role}</strong> in {membership.cohort}
                            {membership.isActive && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payments */}
                {selectedUser.payments?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Payment History</h3>
                    <div className="space-y-2">
                      {selectedUser.payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm">
                            ${(payment.amount / 100).toFixed(2)} - {payment.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}