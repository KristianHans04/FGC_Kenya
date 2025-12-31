import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Super Admin - Users',
  description: 'Advanced user management',
  noIndex: true,
})
on'
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  UserPlus,
  Shield,
  Star,
  Ban,
  Edit,
  Mail,
  Calendar,
  School,
  ChevronDown
} from 'lucide-react'

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterYear, setFilterYear] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'school'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
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

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.school?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = filterRole === 'ALL' || user.role === filterRole
      const matchesYear = filterYear === 'ALL'
      const matchesStatus = filterStatus === 'ALL' || 
        (filterStatus === 'ACTIVE' && user.isActive) ||
        (filterStatus === 'INACTIVE' && !user.isActive)

      return matchesSearch && matchesRole && matchesYear && matchesStatus
    })
    .sort((a, b) => {
      let aVal = a[sortBy] || ''
      let bVal = b[sortBy] || ''
      
      if (sortBy === 'name') {
        aVal = `${a.firstName || ''} ${a.lastName || ''}`
        bVal = `${b.firstName || ''} ${b.lastName || ''}`
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'School', 'Year', 'Status', 'Joined']
    const rows = filteredUsers.map(user => [
      `${user.firstName || ''} ${user.lastName || ''}`,
      user.email,
      user.role,
      user.school || '',
      '',
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Users Management</h1>
        <p className="text-muted-foreground">Complete user database with advanced controls</p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="ALL">All Roles</option>
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
            className="px-3 py-2 border rounded-lg"
          >
            <option value="ALL">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Sort Options */}
        <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          {['name', 'email', 'school', 'createdAt'].map(field => (
            <button
              key={field}
              onClick={() => {
                if (sortBy === field) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy(field as any)
                  setSortOrder('asc')
                }
              }}
              className={`px-2 py-1 rounded ${sortBy === field ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {sortBy === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">School</th>
                <th className="text-left p-4">Year</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {user.firstName || user.lastName ? 
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                            'Unnamed User'}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'MENTOR' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'STUDENT' ? 'bg-green-100 text-green-800' :
                        user.role === 'ALUMNI' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{user.school || '-'}</td>
                    <td className="p-4 text-sm">-</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`h-2 w-2 rounded-full ${
                          user.isActive ? 'bg-green-600' : 'bg-red-600'
                        }`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-muted rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded text-destructive">
                          <Ban className="h-4 w-4" />
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
    </div>
  )
}