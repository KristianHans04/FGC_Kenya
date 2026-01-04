'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  School,
  MapPin,
  Calendar,
  Shield,
  Ban,
  UserCheck,
  UserX,
  Edit,
  Save,
  UserMinus,
  X,
  Trash2,
  Send,
  FileText,
  Clock,
  Activity,
  Award,
  BookOpen,
  MessageSquare,
  CreditCard,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  Download,
  Eye,
  History,
  Users,
  Settings,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'

interface UserDetails {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  school: string | null
  year: string | null
  role: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  isActive: boolean
  isBanned: boolean
  emailVerified: boolean
  address?: string
  bio?: string
  profileImage?: string
  
  // Related data
  cohortMemberships: Array<{
    id: string
    cohort: string
    role: string
    year: string
    joinedAt: string
    leftAt?: string
    isActive: boolean
  }>
  
  applications: Array<{
    id: string
    season: string
    status: string
    submittedAt: string
    reviewedAt?: string
    responses: Record<string, any>
    reviewer?: { email: string; firstName?: string; lastName?: string }
    reviewNotes?: string
    rejectionFeedback?: string
  }>
  
  articles: Array<{
    id: string
    title: string
    slug: string
    status: 'draft' | 'published' | 'archived'
    publishedAt?: string
    views: number
    likes: number
    createdAt: string
    updatedAt: string
  }>
  
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    type: string
    description?: string
    createdAt: string
  }>
  
  activityLogs: Array<{
    id: string
    action: string
    details?: string
    ipAddress?: string
    userAgent?: string
    createdAt: string
  }>
}

type TabType = 'overview' | 'profile' | 'applications' | 'articles' | 'payments' | 'activity' | 'roles'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  
  const { user: currentUser, isLoading: authLoading, isAuthenticated } = useAuth()
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'
  const canEdit = isSuperAdmin || currentUser?.role === 'ADMIN'
  
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<UserDetails>>({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [savingChanges, setSavingChanges] = useState(false)
  const [impersonating, setImpersonating] = useState(false)

  useEffect(() => {
    document.title = 'User Details | FIRST Global Team Kenya'
  }, [])

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
        router.push('/dashboard')
      }
    }
  }, [authLoading, isAuthenticated, currentUser, router])

  // Fetch user details
  useEffect(() => {
    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}?includeAll=true`, {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/auth/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.data?.user)
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      // Mock data for development
      setUser({
        id: userId,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254700000001',
        school: 'Nairobi High School',
        year: 'Form 4',
        role: 'STUDENT',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastLoginAt: '2024-12-20T14:30:00Z',
        isActive: true,
        isBanned: false,
        emailVerified: true,
        address: '123 Main St, Nairobi',
        bio: 'Passionate about robotics and STEM education.',
        cohortMemberships: [
          {
            id: '1',
            cohort: 'FGC 2024',
            role: 'STUDENT',
            year: '2024',
            joinedAt: '2024-01-15T10:00:00Z',
            isActive: false,
            leftAt: '2024-12-01T00:00:00Z'
          },
          {
            id: '2',
            cohort: 'FGC 2025',
            role: 'MENTOR',
            year: '2025',
            joinedAt: '2025-01-01T00:00:00Z',
            isActive: true
          }
        ],
        applications: [
          {
            id: '1',
            season: 'FGC 2024',
            status: 'accepted',
            submittedAt: '2024-01-20T10:00:00Z',
            reviewedAt: '2024-02-01T10:00:00Z',
            responses: {
              motivation: 'I want to represent my country in robotics...',
              experience: 'Participated in school science fair...'
            }
          }
        ],
        articles: [],
        payments: [
          {
            id: '1',
            amount: 5000,
            currency: 'KES',
            status: 'completed',
            type: 'registration',
            description: 'FGC 2024 Registration',
            createdAt: '2024-01-25T10:00:00Z'
          }
        ],
        activityLogs: [
          {
            id: '1',
            action: 'login',
            details: 'User logged in',
            ipAddress: '192.168.1.1',
            userAgent: 'Chrome/120.0',
            createdAt: '2024-12-20T14:30:00Z'
          },
          {
            id: '2',
            action: 'profile_update',
            details: 'Updated phone number',
            createdAt: '2024-12-15T10:00:00Z'
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    setSavingChanges(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editedUser)
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.data?.user)
        setIsEditing(false)
        setEditedUser({})
      }
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setSavingChanges(false)
    }
  }

  const handleBanUser = async (ban: boolean) => {
    try {
      const endpoint = ban ? `/api/admin/users/${userId}/ban` : `/api/admin/users/${userId}/unban`
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchUserDetails()
        setShowBanModal(false)
      }
    } catch (error) {
      console.error('Failed to ban/unban user:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        router.push('/admin/super/users')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleImpersonate = async () => {
    if (impersonating) return
    
    setImpersonating(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/impersonate`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        // Redirect to the impersonated user's dashboard
        router.push(data.data?.redirectUrl || '/dashboard')
      } else {
        console.error('Failed to impersonate user')
      }
    } catch (error) {
      console.error('Impersonation error:', error)
    } finally {
      setImpersonating(false)
    }
  }

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: user?.email,
          subject: emailSubject,
          message: emailMessage,
          userId
        })
      })
      
      if (response.ok) {
        setShowEmailModal(false)
        setEmailSubject('')
        setEmailMessage('')
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setSendingEmail(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      MENTOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      STUDENT: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      ALUMNI: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      USER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return colors[role] || colors.USER
  }

  const getApplicationStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      submitted: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: Clock },
      under_review: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', icon: Eye },
      shortlisted: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: Star },
      accepted: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', icon: XCircle }
    }
    
    const badge = badges[status] || badges.submitted
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
          <Link
            href="/admin/super/users"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Link
            href="/admin/super/users"
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              {user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.email}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        {canEdit && (
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-border rounded-lg hover:bg-muted flex items-center gap-2 text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </button>
            
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true)
                  setEditedUser(user)
                }}
                className="px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 transition-opacity"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedUser({})
                  }}
                  className="px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={savingChanges}
                  className="px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition-opacity"
                >
                  {savingChanges ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Save</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* User Status Bar */}
      <div className="bg-card p-3 sm:p-4 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
          
          {user.isBanned ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive">
              <Ban className="h-4 w-4" />
              Banned
            </span>
          ) : user.isActive ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
              <UserCheck className="h-4 w-4" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              <UserX className="h-4 w-4" />
              Inactive
            </span>
          )}
          
          {user.emailVerified && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              Verified
            </span>
          )}
          
          {isSuperAdmin && (
            <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap gap-2 mt-3 sm:mt-0">
              {/* Impersonate button - only for non-super-admin users */}
              {user.role !== 'SUPER_ADMIN' && (
                <button
                  onClick={handleImpersonate}
                  disabled={impersonating}
                  className="px-2 py-1 sm:px-3 bg-purple-600 text-white rounded-lg text-xs sm:text-sm hover:bg-purple-700 flex items-center gap-1 disabled:opacity-50"
                >
                  {impersonating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Impersonating...
                    </>
                  ) : (
                    <>
                      <UserMinus className="h-3 w-3" />
                      Impersonate
                    </>
                  )}
                </button>
              )}
              
              {user.isBanned ? (
                <button
                  onClick={() => handleBanUser(false)}
                  className="px-2 py-1 sm:px-3 bg-green-600 text-white rounded-lg text-xs sm:text-sm hover:bg-green-700"
                >
                  Unban User
                </button>
              ) : (
                <button
                  onClick={() => setShowBanModal(true)}
                  className="px-2 py-1 sm:px-3 bg-yellow-600 text-white rounded-lg text-xs sm:text-sm hover:bg-yellow-700"
                >
                  Ban User
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-2 py-1 sm:px-3 bg-destructive text-destructive-foreground rounded-lg text-xs sm:text-sm hover:opacity-90"
              >
                Delete User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'profile', label: 'Profile', icon: Settings },
            { id: 'roles', label: 'Role History', icon: History },
            { id: 'applications', label: 'Applications', icon: FileText },
            { id: 'articles', label: 'Articles', icon: BookOpen },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'activity', label: 'Activity Logs', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm sm:text-base border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-4 text-foreground">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium text-foreground">{user.school || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium text-foreground">{user.year || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{user.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-4 text-foreground">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs text-foreground">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">
                      {new Date(user.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium text-foreground">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
                  <h3 className="font-semibold mb-3 text-foreground">Bio</h3>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold mb-4 text-foreground">Edit Profile</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={editedUser.firstName || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editedUser.lastName || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">School</label>
                  <input
                    type="text"
                    value={editedUser.school || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, school: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="text"
                    value={editedUser.year || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, year: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={editedUser.address || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={editedUser.bio || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={editedUser.role || user.role}
                      onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="USER">User</option>
                      <option value="STUDENT">Student</option>
                      <option value="ALUMNI">Alumni</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Click Edit to modify user profile</p>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Role History & Organization Relationship</h3>
            {user.cohortMemberships.length > 0 ? (
              <div className="space-y-3">
                {user.cohortMemberships.map((membership) => (
                  <div key={membership.id} className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-foreground">{membership.cohort}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(membership.role)}`}>
                            {membership.role}
                          </span>
                          {membership.isActive && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined: {new Date(membership.joinedAt).toLocaleDateString()}
                          </span>
                          {membership.leftAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Left: {new Date(membership.leftAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No role history available</p>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Applications ({user.applications.length})</h3>
            {user.applications.length > 0 ? (
              <div className="space-y-3">
                {user.applications.map((app) => (
                  <div key={app.id} className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{app.season}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getApplicationStatusBadge(app.status)}
                          <span className="text-sm text-muted-foreground">
                            Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                          {app.reviewedAt && (
                            <span className="text-sm text-muted-foreground">
                              " Reviewed: {new Date(app.reviewedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
                      >
                        View Details
                      </Link>
                    </div>
                    
                    {app.responses && Object.keys(app.responses).length > 0 && (
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-primary hover:underline">
                          View Responses
                        </summary>
                        <div className="mt-3 space-y-2">
                          {Object.entries(app.responses).map(([key, value]) => (
                            <div key={key} className="p-3 bg-muted/50 rounded">
                              <p className="text-sm font-medium text-foreground mb-1">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-muted-foreground">{value as string}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    
                    {app.reviewNotes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded">
                        <p className="text-sm font-medium text-foreground mb-1">Review Notes</p>
                        <p className="text-sm text-muted-foreground">{app.reviewNotes}</p>
                      </div>
                    )}
                    
                    {app.rejectionFeedback && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Rejection Feedback</p>
                        <p className="text-sm text-red-600 dark:text-red-300">{app.rejectionFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No applications submitted</p>
            )}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Articles ({user.articles.length})</h3>
            {user.articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.articles.map((article) => (
                  <div key={article.id} className="bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{article.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : article.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {article.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {article.likes} likes
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Created: {new Date(article.createdAt).toLocaleDateString()}
                      {article.publishedAt && (
                        <span> · Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      View Article 
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No articles published</p>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Payment History ({user.payments.length})</h3>
            {user.payments.length > 0 ? (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3 text-sm">Date</th>
                      <th className="text-left p-3 text-sm">Type</th>
                      <th className="text-left p-3 text-sm">Description</th>
                      <th className="text-right p-3 text-sm">Amount</th>
                      <th className="text-left p-3 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-sm capitalize">{payment.type}</td>
                        <td className="p-3 text-sm">{payment.description || '-'}</td>
                        <td className="p-3 text-sm text-right font-medium">
                          {payment.currency} {(payment.amount / 100).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No payments recorded</p>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Activity Logs ({user.activityLogs.length})</h3>
              <button
                onClick={fetchUserDetails}
                className="px-3 py-1 border border-border rounded-lg hover:bg-muted text-sm flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
            {user.activityLogs.length > 0 ? (
              <div className="space-y-2">
                {user.activityLogs.map((log) => (
                  <div key={log.id} className="bg-card p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm text-foreground capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-1 ml-6">{log.details}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 ml-6">
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                          {log.userAgent && <span>Browser: {log.userAgent.split('/')[0]}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No activity logs available</p>
            )}
          </div>
        )}
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !sendingEmail && setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4 text-foreground">Send Email to User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={6}
                    placeholder="Enter your message..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEmailModal(false)}
                  disabled={sendingEmail}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailSubject || !emailMessage}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ban Modal */}
      <AnimatePresence>
        {showBanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Ban className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Ban User</h2>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to ban <strong>{user.email}</strong>? 
                This will prevent them from accessing their account.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBanUser(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Ban User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Delete User</h2>
              </div>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-destructive font-medium">Warning: This action cannot be undone!</p>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Are you absolutely sure you want to permanently delete <strong>{user.email}</strong>? 
                All of their data, including applications, articles, and payment history will be permanently removed.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}