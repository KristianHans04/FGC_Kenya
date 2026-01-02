/**
 * @file components/email/EmailLayout.tsx
 * @description Clean email layout component following 60/30/10 design rule
 * Rebuilt from scratch for better light/dark mode support
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
  Menu,
  X,
  CheckSquare,
  Square
} from 'lucide-react'
import EmailComposer from './EmailComposer'
import EmailViewer from './EmailViewer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

export default function EmailLayout() {
  const pathname = usePathname()
  const [emails, setEmails] = useState<Email[]>([])
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [showComposer, setShowComposer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  // Extract folder from pathname
  const getCurrentFolder = () => {
    const parts = pathname.split('/')
    const folderIndex = parts.findIndex(p => p === 'emails')
    if (folderIndex !== -1 && parts[folderIndex + 1]) {
      return parts[folderIndex + 1]
    }
    return 'inbox'
  }

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const folder = getCurrentFolder()
      const response = await fetch(`/api/admin/emails?folder=${folder}`)
      if (response.ok) {
        const result = await response.json()
        // Handle both direct array and nested structure
        if (Array.isArray(result)) {
          setEmails(result)
        } else if (result.data && Array.isArray(result.data.emails)) {
          setEmails(result.data.emails)
        } else if (result.emails && Array.isArray(result.emails)) {
          setEmails(result.emails)
        } else {
          console.error('Unexpected email data structure:', result)
          setEmails([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }, [pathname])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  // Show success notification
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

  // Calculate unread counts for each folder
  const getUnreadCount = (folderId: string) => {
    if (getCurrentFolder() === folderId) {
      return emails.filter(e => !e.isRead).length
    }
    return 0
  }

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/admin/emails/inbox', unread: getUnreadCount('inbox') },
    { id: 'sent', label: 'Sent', icon: Send, href: '/admin/emails/sent', unread: 0 },
    { id: 'drafts', label: 'Drafts', icon: FileText, href: '/admin/emails/drafts', unread: getUnreadCount('drafts') },
    { id: 'starred', label: 'Starred', icon: Star, href: '/admin/emails/starred', unread: 0 },
    { id: 'archived', label: 'Archived', icon: Archive, href: '/admin/emails/archived', unread: 0 },
    { id: 'trash', label: 'Trash', icon: Trash2, href: '/admin/emails/trash', unread: 0 }
  ]

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar - 20% width on desktop */}
      <aside className={cn(
        "w-64 bg-card border-r border-border",
        "fixed inset-y-0 left-0 z-30 lg:relative lg:z-0",
        "transform transition-transform lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setShowComposer(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Compose
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.unread > 0 && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">
                      {item.unread}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Management Section */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Management
            </p>
            <div className="space-y-1">
              <Link
                href="/admin/emails/groups"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Groups</span>
              </Link>
              <Link
                href="/admin/emails/campaigns"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Campaigns</span>
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-card rounded-lg shadow-md border border-border"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Email List - 30% width on desktop when email is open */}
      <div className={cn(
        "bg-card",
        currentEmail
          ? "hidden lg:block lg:w-96 lg:border-r lg:border-border"
          : "flex-1"
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <button
            onClick={handleSelectAll}
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            {Array.isArray(emails) && selectedEmails.size === emails.length ? (
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={fetchEmails}
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {Array.isArray(emails) ? emails.length : 0} emails
          </span>
        </div>

        {/* Email List */}
        <div className="overflow-y-auto h-[calc(100vh-60px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : !Array.isArray(emails) || emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Inbox className="h-8 w-8 mb-2" />
              <p>No emails</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {Array.isArray(emails) && emails.map(email => (
                <div
                  key={email.id}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !email.isRead && "bg-green-50 dark:bg-green-900/20"
                  )}
                  onClick={() => {
                    // Mark email as read
                    const updatedEmail = { ...email, isRead: true }
                    setCurrentEmail(updatedEmail)
                    // Update emails list
                    setEmails(prev => prev.map(e => 
                      e.id === email.id ? { ...e, isRead: true } : e
                    ))
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmails.has(email.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleSelectEmail(email.id)
                    }}
                    className="mt-1 rounded border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-sm truncate",
                        !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>
                        {email.sender.name || email.sender.email}
                      </span>
                      {email.isStarred && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <div className={cn(
                      "text-sm truncate mb-1",
                      !email.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {email.subject || '(no subject)'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {email.plainText || email.body || '(no content)'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(email.sentAt || email.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Viewer - Takes remaining space (60%) */}
      {currentEmail && (
        <div className="flex-1 bg-card">
          <EmailViewer
            email={{
              ...currentEmail,
              from: currentEmail.sender.email,
              to: currentEmail.toEmails,
              cc: currentEmail.ccEmails,
              bcc: currentEmail.bccEmails,
              plainText: currentEmail.plainText || ''
            }}
            onClose={() => setCurrentEmail(null)}
            onBack={() => setCurrentEmail(null)}
            onReply={() => {
              setShowComposer(true)
              setCurrentEmail(null)
            }}
            onReplyAll={() => {
              setShowComposer(true)
              setCurrentEmail(null)
            }}
            onForward={() => {
              setShowComposer(true)
              setCurrentEmail(null)
            }}
            onDelete={() => {
              setEmails(prev => prev.filter(e => e.id !== currentEmail.id))
              setCurrentEmail(null)
            }}
            onArchive={() => {
              setEmails(prev => prev.filter(e => e.id !== currentEmail.id))
              setCurrentEmail(null)
            }}
          />
        </div>
      )}

      {/* Empty State when no email selected on desktop */}
      {!currentEmail && (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Select an email to read</p>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {showComposer && (
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
                
                // If we're in the sent folder, add the email immediately
                if (getCurrentFolder() === 'sent') {
                  const sentEmail = result.data.email
                  // Convert API format to component format
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
                  // Otherwise refresh to get updated counts
                  await fetchEmails()
                }
              } else {
                console.error('Failed to send email')
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
      )}

      {/* Success Notification */}
      {sendSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Email sent successfully!</span>
          </div>
        </div>
      )}
    </div>
  )
}