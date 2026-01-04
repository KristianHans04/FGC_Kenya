/**
 * @file components/email/EmailLayout.tsx
 * @description Enhanced email layout with modern horizontal tabs and premium styling
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/app/lib/utils/cn'
import {
  Inbox,
  Send,
  FileText,
  Star,
  Archive,
  Trash2,
  Users,
  MessageSquare,
  Plus,
  RefreshCw,
  CheckSquare,
  Square,
  Search
} from 'lucide-react'
import EmailComposer from './EmailComposer'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface Email {
  id: string
  subject: string
  body: string
  plainText?: string
  isRead: boolean
  isStarred: boolean
  isDraft: boolean
  sentAt: string | null
  createdAt: string
  labels: string[]
  attachments: any[]
  sender: {
    email: string
    name?: string
  }
  toEmails: string[]
  ccEmails: string[]
  bccEmails: string[]
}

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  filters: Record<string, string>
  createdAt: string
}

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  recipientCount: number
  openRate: number
  clickRate: number
  sentAt: string
  createdAt: string
}

// Management View Component for Groups and Campaigns
function ManagementView({ folder }: { folder: string }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form states for new group
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  
  // Form states for new campaign
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignSubject, setNewCampaignSubject] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      if (folder === 'groups') {
        const response = await fetch('/api/admin/emails/groups')
        if (response.ok) {
          const result = await response.json()
          setGroups(result.data?.groups || [])
        }
      } else if (folder === 'campaigns') {
        const response = await fetch('/api/admin/emails/campaigns')
        if (response.ok) {
          const result = await response.json()
          setCampaigns(result.data?.campaigns || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [folder])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/admin/emails/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription
        })
      })
      
      if (response.ok) {
        setShowModal(false)
        setNewGroupName('')
        setNewGroupDescription('')
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim() || !newCampaignSubject.trim()) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/admin/emails/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaignName,
          subject: newCampaignSubject,
          status: 'draft'
        })
      })
      
      if (response.ok) {
        setShowModal(false)
        setNewCampaignName('')
        setNewCampaignSubject('')
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    )
  }

  if (folder === 'groups') {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Email Groups</h1>
              <p className="text-muted-foreground">Manage recipient groups for bulk email campaigns</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No groups yet</h3>
              <p className="text-muted-foreground">Create your first email group to start organizing recipients</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.map(group => (
                <div key={group.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        {group.memberCount} members
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Group Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden ring-1 ring-border">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Create New Group</h2>
                <p className="text-sm text-muted-foreground mt-1">Add a new email recipient group</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Group Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Newsletter Subscribers"
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe this group..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setNewGroupName('')
                    setNewGroupDescription('')
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={saving || !newGroupName.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Campaigns view
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Email Campaigns</h1>
            <p className="text-muted-foreground">Create and manage email marketing campaigns</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground">Create your first campaign to reach your audience</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full capitalize",
                    campaign.status === 'sent' 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : campaign.status === 'draft'
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  <span>{campaign.recipientCount} recipients</span>
                  <span>{campaign.openRate}% open rate</span>
                  <span>{campaign.clickRate}% click rate</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden ring-1 ring-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Create New Campaign</h2>
              <p className="text-sm text-muted-foreground mt-1">Start a new email marketing campaign</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Welcome Series"
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Subject</label>
                <input
                  type="text"
                  value={newCampaignSubject}
                  onChange={(e) => setNewCampaignSubject(e.target.value)}
                  placeholder="e.g., Welcome to FGC Kenya!"
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setNewCampaignName('')
                  setNewCampaignSubject('')
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={saving || !newCampaignName.trim() || !newCampaignSubject.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EmailLayout() {
  const pathname = usePathname()
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [showComposer, setShowComposer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const getCurrentFolder = () => {
    const parts = pathname.split('/')
    const folderIndex = parts.findIndex(p => p === 'emails')
    if (folderIndex !== -1 && parts[folderIndex + 1]) {
      return parts[folderIndex + 1]
    }
    return 'inbox'
  }

  const isManagementView = () => {
    const folder = getCurrentFolder()
    return folder === 'groups' || folder === 'campaigns'
  }

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const folder = getCurrentFolder()
      const queryParams = new URLSearchParams({
        folder,
        ...(searchQuery && { search: searchQuery })
      })
      const response = await fetch(`/api/admin/emails?${queryParams}`)
      if (response.ok) {
        const result = await response.json()
        if (Array.isArray(result)) {
          setEmails(result)
        } else if (result.data && Array.isArray(result.data.emails)) {
          setEmails(result.data.emails)
        } else if (result.emails && Array.isArray(result.emails)) {
          setEmails(result.emails)
        } else {
          setEmails([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }, [pathname, searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmails()
    }, 500) // Debounce search
    return () => clearTimeout(timer)
  }, [fetchEmails])

  useEffect(() => {
    if (sendSuccess) {
      const timer = setTimeout(() => setSendSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [sendSuccess])

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => {
      const newSet = new Set(prev)
      if (newSet.has(emailId)) {
        newSet.delete(emailId)
      } else {
        newSet.add(emailId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (!Array.isArray(emails)) return
    
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(emails.map(e => e.id)))
    }
  }

  const handleToggleStar = async (emailId: string, currentStatus: boolean) => {
    // Optimistic update
    setEmails(prev => prev.map(e => 
      e.id === emailId ? { ...e, isStarred: !currentStatus } : e
    ))

    try {
      await fetch('/api/admin/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, isStarred: !currentStatus })
      })
    } catch (error) {
      console.error('Failed to toggle star:', error)
      // Revert on error
      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, isStarred: currentStatus } : e
      ))
    }
  }

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/admin/emails/inbox', color: 'text-blue-500' },
    { id: 'sent', label: 'Sent', icon: Send, href: '/admin/emails/sent', color: 'text-green-500' },
    { id: 'drafts', label: 'Drafts', icon: FileText, href: '/admin/emails/drafts', color: 'text-gray-500' },
    { id: 'starred', label: 'Starred', icon: Star, href: '/admin/emails/starred', color: 'text-yellow-500' },
    { id: 'archived', label: 'Archived', icon: Archive, href: '/admin/emails/archived', color: 'text-purple-500' },
    { id: 'trash', label: 'Trash', icon: Trash2, href: '/admin/emails/trash', color: 'text-red-500' },
    { id: 'groups', label: 'Groups', icon: Users, href: '/admin/emails/groups', color: 'text-indigo-500' },
    { id: 'campaigns', label: 'Campaigns', icon: MessageSquare, href: '/admin/emails/campaigns', color: 'text-pink-500' }
  ]

  const currentTab = getCurrentFolder()
  const unreadCount = emails.filter(e => !e.isRead).length

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Header Section */}
      <div className="bg-card border-b border-border shadow-sm">
        {/* Top Bar with Search and Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Compose</span>
            </button>
            
            <div className="relative hidden md:flex flex-1 max-w-md ml-4 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              disabled={loading}
              title="Refresh emails"
            >
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Modern Navigation Tabs */}
        <div className="px-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max pb-3">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = currentTab === tab.id
              const tabUnread = isActive ? unreadCount : 0
              
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "group flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 border",
                    isActive
                      ? "bg-primary/10 border-primary/20 text-primary font-medium"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    !isActive && tab.color
                  )} />
                  <span className="text-sm whitespace-nowrap">{tab.label}</span>
                  {tabUnread > 0 && (
                    <span className={cn(
                      "ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full",
                      isActive ? "bg-primary text-white" : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {tabUnread}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-muted/5">
        {!isManagementView() ? (
          <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6">
            <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
                <button
                  onClick={handleSelectAll}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  {Array.isArray(emails) && emails.length > 0 && selectedEmails.size === emails.length ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                
                <div className="h-4 w-px bg-border mx-2" />
                
                <span className="text-sm font-medium text-muted-foreground">
                  {Array.isArray(emails) ? emails.length : 0} messages
                </span>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      </div>
                      <span className="text-muted-foreground font-medium">Loading your emails...</span>
                    </div>
                  </div>
                ) : !Array.isArray(emails) || emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                    <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                      <Inbox className="h-12 w-12 opacity-20" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No emails found</h3>
                    <p className="text-sm max-w-xs text-center">
                      Your {getCurrentFolder()} folder is empty. New messages will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {Array.isArray(emails) && emails.map(email => (
                      <div
                        key={email.id}
                        className={cn(
                          "group flex items-center gap-4 px-4 py-4 cursor-pointer transition-all duration-200",
                          !email.isRead 
                            ? "bg-primary/[0.02] hover:bg-primary/[0.04]" 
                            : "bg-card hover:bg-muted/30"
                        )}
                        onClick={async () => {
                          router.push(`/admin/emails/${getCurrentFolder()}/${email.id}`)
                          
                          if (!email.isRead) {
                            setEmails(prev => prev.map(e => 
                              e.id === email.id ? { ...e, isRead: true } : e
                            ))
                            
                            try {
                              await fetch('/api/admin/emails', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ emailId: email.id, isRead: true })
                              })
                            } catch (error) {
                              console.error('Failed to mark email as read:', error)
                            }
                          }
                        }}
                      >
                        {/* Checkbox & Star */}
                        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(email.id)}
                            onChange={() => handleSelectEmail(email.id)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 transition-all"
                          />
                          <button 
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleStar(email.id, email.isStarred)
                            }}
                          >
                            <Star className={cn(
                              "h-4 w-4 transition-colors",
                              email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                            )} />
                          </button>
                        </div>
                        
                        {/* Avatar */}
                        <div className="hidden sm:flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center text-xs font-bold text-primary shrink-0">
                          {(email.sender.name || email.sender.email).charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
                          <span className={cn(
                            "w-40 truncate text-sm",
                            !email.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80"
                          )}>
                            {email.sender.name || email.sender.email}
                          </span>
                          
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn(
                              "text-sm truncate",
                              !email.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/70"
                            )}>
                              {email.subject || '(no subject)'}
                            </span>
                            <span className="text-sm text-muted-foreground truncate hidden lg:inline">
                              - {email.plainText || email.body || ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {email.attachments?.length > 0 && (
                              <div className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>File</span>
                              </div>
                            )}
                            <span className={cn(
                              "text-xs whitespace-nowrap",
                              !email.isRead ? "text-primary font-bold" : "text-muted-foreground"
                            )}>
                              {new Date(email.sentAt || email.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ManagementView folder={getCurrentFolder()} />
        )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden ring-1 ring-border animate-in zoom-in-95 duration-200">
            <EmailComposer
              onClose={() => setShowComposer(false)}
              onSend={async (data) => {
                try {
                  const response = await fetch('/api/admin/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  })
                  
                  if (response.ok) {
                    const result = await response.json()
                    setShowComposer(false)
                    setSendSuccess(true)
                    
                    if (getCurrentFolder() === 'sent') {
                      const sentEmail = result.data.email
                      const formattedEmail = {
                        ...sentEmail,
                        from: sentEmail.sender.email,
                        to: sentEmail.toEmails,
                        cc: sentEmail.ccEmails,
                        bcc: sentEmail.bccEmails,
                        plainText: sentEmail.plainText || ''
                      }
                      setEmails(prev => [formattedEmail, ...prev])
                    } else {
                      await fetchEmails()
                    }
                  }
                } catch (error) {
                  console.error('Error sending email:', error)
                }
              }}
              onSaveDraft={async (data) => {
                try {
                  const response = await fetch('/api/admin/emails/drafts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, isDraft: true })
                  })
                  
                  if (response.ok) {
                    setShowComposer(false)
                    await fetchEmails()
                  }
                } catch (error) {
                  console.error('Error saving draft:', error)
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {sendSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-primary text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Send className="h-3 w-3" />
            </div>
            <span className="font-medium">Email sent successfully!</span>
          </div>
        </div>
      )}
    </div>
  )
}