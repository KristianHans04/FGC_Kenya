'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Send,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Edit,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  ArrowLeft,
  Settings,
  Download,
  Upload,
  Calendar,
  School,
  Shield,
  User
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'

interface GroupMember {
  id: string
  name: string
  email: string
}

interface EmailGroup {
  id: string
  name: string
  description: string
  memberCount: number
  members: GroupMember[]
  createdAt: string
  updatedAt: string
  isCustom: boolean
}

interface FilterOptions {
  role?: string
  cohort?: string
  year?: string
  school?: string
  gender?: string
  status?: string
}

export default function EmailGroups() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  
  const [groups, setGroups] = useState<EmailGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<EmailGroup | null>(null)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showComposeEmail, setShowComposeEmail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Create group form
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    members: [] as GroupMember[]
  })
  
  // Email composition
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    attachments: [] as File[]
  })
  
  // Filters for dynamic groups
  const [filters, setFilters] = useState<FilterOptions>({})
  const [availableFilters, setAvailableFilters] = useState({
    roles: ['STUDENT', 'ALUMNI', 'MENTOR', 'ADMIN'],
    cohorts: ['FGC 2025', 'FGC 2024', 'FGC 2023', 'FGC 2022'],
    years: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Alumni'],
    schools: [] as string[],
    genders: ['Male', 'Female', 'Other']
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  useEffect(() => {
    document.title = 'Group Emails | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Send targeted emails to user groups')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Send targeted emails to user groups'
      document.head.appendChild(meta)
    }
  }, [])
  
  useEffect(() => {
    if (!authLoading && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN')) {
      fetchGroups()
      fetchAvailableFilters()
    }
  }, [authLoading, currentUser])
  
  const fetchGroups = async () => {
    setLoading(true)
    try {
      // Fetch predefined groups
      const predefinedGroups: EmailGroup[] = [
        {
          id: 'all-users',
          name: 'All Users',
          description: 'Send email to all registered users',
          memberCount: 0,
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: false
        },
        {
          id: 'all-admins',
          name: 'All Admins',
          description: 'Send email to all administrators',
          memberCount: 0,
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: false
        },
        {
          id: 'all-students',
          name: 'All Students',
          description: 'Send email to all current students',
          memberCount: 0,
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: false
        },
        {
          id: 'all-mentors',
          name: 'All Mentors',
          description: 'Send email to all mentors',
          memberCount: 0,
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: false
        },
        {
          id: 'all-alumni',
          name: 'All Alumni',
          description: 'Send email to all alumni members',
          memberCount: 0,
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCustom: false
        }
      ]
      
      // Fetch custom groups from API
      const response = await fetch('/api/admin/emails/groups', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const customGroups = data.data?.groups || []
        setGroups([...predefinedGroups, ...customGroups])
      } else {
        setGroups(predefinedGroups)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }
  
  const fetchAvailableFilters = async () => {
    try {
      // Fetch available schools
      const response = await fetch('/api/admin/users/filters', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvailableFilters(prev => ({
          ...prev,
          schools: data.data?.schools || []
        }))
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }
  
  const handleCreateGroup = async () => {
    if (!newGroup.name || newGroup.members.length === 0) {
      setErrorMessage('Group name and at least one member are required')
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/admin/emails/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newGroup)
      })
      
      if (response.ok) {
        setSuccessMessage('Group created successfully!')
        setShowCreateGroup(false)
        setNewGroup({ name: '', description: '', members: [] })
        fetchGroups()
      } else {
        const error = await response.json()
        setErrorMessage(error.error?.message || 'Failed to create group')
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the group')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return
    
    try {
      const response = await fetch(`/api/admin/emails/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setSuccessMessage('Group deleted successfully')
        fetchGroups()
      }
    } catch (error) {
      setErrorMessage('Failed to delete group')
    }
  }
  
  const handleSendEmail = async () => {
    if (!selectedGroup || !emailData.subject || !emailData.message) {
      setErrorMessage('Please fill all required fields')
      return
    }
    
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/admin/emails/send-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groupId: selectedGroup.id,
          filters: selectedGroup.isCustom ? undefined : filters,
          subject: emailData.subject,
          message: emailData.message
        })
      })
      
      if (response.ok) {
        setSuccessMessage('Emails sent successfully!')
        setShowComposeEmail(false)
        setEmailData({ subject: '', message: '', attachments: [] })
      } else {
        const error = await response.json()
        setErrorMessage(error.error?.message || 'Failed to send emails')
      }
    } catch (error) {
      setErrorMessage('An error occurred while sending emails')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleAddMember = () => {
    const email = prompt('Enter member email:')
    const name = prompt('Enter member name:')
    
    if (email && name) {
      setNewGroup(prev => ({
        ...prev,
        members: [...prev.members, { id: Date.now().toString(), name, email }]
      }))
    }
  }
  
  const handleRemoveMember = (memberId: string) => {
    setNewGroup(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }))
  }
  
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/emails"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Group Emails</h1>
            <p className="text-muted-foreground">Send targeted emails to user groups</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </button>
      </div>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-300">{successMessage}</p>
        </motion.div>
      )}
      
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{errorMessage}</p>
        </motion.div>
      )}
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
      </div>
      
      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map(group => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => {
              setSelectedGroup(group)
              setShowComposeEmail(true)
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{group.name}</h3>
              </div>
              {group.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGroup(group.id)
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {group.memberCount > 0 ? `${group.memberCount} members` : 'Dynamic group'}
              </span>
              <span className="text-primary">
                <Mail className="h-4 w-4 inline mr-1" />
                Send Email
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateGroup(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Create Custom Group</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Group Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="e.g., FGC 2024 Female Mentors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Brief description of this group..."
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Members</label>
                    <button
                      onClick={handleAddMember}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
                    >
                      <UserPlus className="h-3 w-3 inline mr-1" />
                      Add Member
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newGroup.members.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No members added yet
                      </p>
                    ) : (
                      newGroup.members.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Group'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Compose Email Modal */}
      <AnimatePresence>
        {showComposeEmail && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowComposeEmail(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                Compose Email to {selectedGroup.name}
              </h2>
              
              {/* Dynamic Filters for non-custom groups */}
              {!selectedGroup.isCustom && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Fine-tune Recipients
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedGroup.id === 'all-students' && (
                      <>
                        <select
                          value={filters.cohort || ''}
                          onChange={(e) => setFilters({ ...filters, cohort: e.target.value })}
                          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                        >
                          <option value="">All Cohorts</option>
                          {availableFilters.cohorts.map(cohort => (
                            <option key={cohort} value={cohort}>{cohort}</option>
                          ))}
                        </select>
                        
                        <select
                          value={filters.school || ''}
                          onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                        >
                          <option value="">All Schools</option>
                          {availableFilters.schools.map(school => (
                            <option key={school} value={school}>{school}</option>
                          ))}
                        </select>
                        
                        <select
                          value={filters.gender || ''}
                          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                        >
                          <option value="">All Genders</option>
                          {availableFilters.genders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </>
                    )}
                    
                    {(selectedGroup.id === 'all-mentors' || selectedGroup.id === 'all-alumni') && (
                      <>
                        <select
                          value={filters.cohort || ''}
                          onChange={(e) => setFilters({ ...filters, cohort: e.target.value })}
                          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                        >
                          <option value="">All Years</option>
                          {availableFilters.cohorts.map(cohort => (
                            <option key={cohort} value={cohort}>{cohort}</option>
                          ))}
                        </select>
                        
                        <select
                          value={filters.gender || ''}
                          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                          className="px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                        >
                          <option value="">All Genders</option>
                          {availableFilters.genders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Email subject..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowComposeEmail(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSubmitting || !emailData.subject || !emailData.message}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
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
    </div>
  )
}