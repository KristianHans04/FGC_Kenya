import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Email Inbox',
  description: 'View and manage email inbox',
  noIndex: true,
})
 AnimatePresence } from 'framer-motion'
import {
  Mail,
  Inbox,
  Send,
  Star,
  Archive,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Paperclip,
  Clock,
  CheckSquare,
  Square,
  RefreshCw,
  Edit,
  Users,
  Tag
} from 'lucide-react'
import EmailComposer from '@/app/components/email/EmailComposer'
import EmailViewer from '@/app/components/email/EmailViewer'
import Link from 'next/link'

interface Email {
  id: string
  subject: string
  body: string
  plainText?: string
  toEmails: string[]
  ccEmails: string[]
  bccEmails: string[]
  senderId: string
  sender: {
    email: string
    firstName?: string
    lastName?: string
  }
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  isDraft: boolean
  sentAt: string
  threadId?: string
  attachments?: any[]
  labels: any[]
}

export default function EmailInbox() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'starred' | 'archived' | 'trash'>('inbox')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [replyTo, setReplyTo] = useState<Email | null>(null)
  const [forwardEmail, setForwardEmail] = useState<Email | null>(null)

  useEffect(() => {
    fetchEmails()
  }, [activeFolder, page])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        folder: activeFolder,
        page: page.toString(),
        limit: '50'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/admin/emails?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data.data?.emails || [])
        setTotalPages(data.data?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(emails.map(e => e.id)))
    }
  }

  const handleSelectEmail = (emailId: string) => {
    const newSelection = new Set(selectedEmails)
    if (newSelection.has(emailId)) {
      newSelection.delete(emailId)
    } else {
      newSelection.add(emailId)
    }
    setSelectedEmails(newSelection)
  }

  const handleMarkAsRead = async (emailIds: string[]) => {
    try {
      await fetch('/api/admin/emails/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: emailIds, action: 'markRead' })
      })
      fetchEmails()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleStar = async (emailId: string) => {
    try {
      await fetch(`/api/admin/emails/${emailId}/star`, {
        method: 'PUT'
      })
      fetchEmails()
    } catch (error) {
      console.error('Failed to star email:', error)
    }
  }

  const handleArchive = async (emailIds: string[]) => {
    try {
      await fetch('/api/admin/emails/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: emailIds, action: 'archive' })
      })
      fetchEmails()
    } catch (error) {
      console.error('Failed to archive:', error)
    }
  }

  const handleDelete = async (emailIds: string[]) => {
    try {
      await fetch('/api/admin/emails/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: emailIds })
      })
      fetchEmails()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleReply = (email: Email) => {
    setReplyTo(email)
    setShowComposer(true)
  }

  const handleForward = (email: Email) => {
    setForwardEmail(email)
    setShowComposer(true)
  }

  const handleSendEmail = async (emailData: any) => {
    try {
      await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      setShowComposer(false)
      setReplyTo(null)
      setForwardEmail(null)
      fetchEmails()
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  const handleSaveDraft = async (emailData: any) => {
    try {
      await fetch('/api/admin/emails/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      setShowComposer(false)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const getEmailPreview = (body: string) => {
    const text = body.replace(/<[^>]*>/g, '').trim()
    return text.length > 100 ? text.substring(0, 100) + '...' : text
  }

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: emails.filter(e => !e.isRead).length },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'drafts', label: 'Drafts', icon: Edit },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 }
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col">
        <div className="p-4">
          <button
            onClick={() => setShowComposer(true)}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90"
          >
            <Edit className="h-4 w-4" />
            Compose
          </button>
        </div>

        <nav className="flex-1 px-2">
          {folders.map((folder) => {
            const Icon = folder.icon
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveFolder(folder.id as any)
                  setCurrentEmail(null)
                }}
                className={`w-full px-3 py-2 rounded-lg flex items-center gap-3 mb-1 transition-colors ${
                  activeFolder === folder.id 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count !== undefined && folder.count > 0 && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    {folder.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Link
            href="/admin/emails/groups"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Groups
          </Link>
          <Link
            href="/admin/emails/campaigns"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mt-2"
          >
            <Send className="h-4 w-4" />
            Campaigns
          </Link>
        </div>
      </div>

      {/* Email List */}
      <div className={`flex-1 flex flex-col ${currentEmail ? 'hidden lg:flex lg:w-2/5' : ''}`}>
        {/* Toolbar */}
        <div className="border-b p-3 flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="p-2 hover:bg-muted rounded"
          >
            {selectedEmails.size === emails.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => fetchEmails()}
            className="p-2 hover:bg-muted rounded"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {selectedEmails.size > 0 && (
            <>
              <button
                onClick={() => handleArchive(Array.from(selectedEmails))}
                className="p-2 hover:bg-muted rounded"
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(Array.from(selectedEmails))}
                className="p-2 hover:bg-muted rounded text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMarkAsRead(Array.from(selectedEmails))}
                className="p-2 hover:bg-muted rounded"
              >
                <Mail className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{emails.length} emails</span>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1 hover:bg-muted rounded disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1 hover:bg-muted rounded disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') fetchEmails()
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Mail className="h-8 w-8 mb-2" />
              <p>No emails found</p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                className={`border-b hover:bg-muted/50 cursor-pointer ${
                  !email.isRead ? 'bg-muted/20' : ''
                }`}
                onClick={() => {
                  setCurrentEmail(email)
                  if (!email.isRead) {
                    handleMarkAsRead([email.id])
                  }
                }}
              >
                <div className="flex items-start gap-3 p-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectEmail(email.id)
                    }}
                    className="mt-1"
                  >
                    {selectedEmails.has(email.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStar(email.id)
                    }}
                    className="mt-1"
                  >
                    <Star className={`h-4 w-4 ${
                      email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''
                    }`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm truncate ${
                            !email.isRead ? 'font-semibold' : ''
                          }`}>
                            {email.sender.firstName || email.sender.email.split('@')[0]}
                          </span>
                          {email.attachments && email.attachments.length > 0 && (
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className={`text-sm truncate ${
                          !email.isRead ? 'font-medium' : ''
                        }`}>
                          {email.subject || '(no subject)'}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {getEmailPreview(email.body)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(email.sentAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Viewer */}
      {currentEmail && (
        <div className="flex-1 flex flex-col">
          <EmailViewer
            email={{
              ...currentEmail,
              from: currentEmail.sender.email,
              to: currentEmail.toEmails,
              cc: currentEmail.ccEmails,
              bcc: currentEmail.bccEmails,
              plainText: currentEmail.plainText || '',
              sentAt: currentEmail.sentAt,
              createdAt: currentEmail.sentAt,
              labels: currentEmail.labels.map((l: any) => l.name || ''),
              attachments: currentEmail.attachments || []
            }}
            onClose={() => setCurrentEmail(null)}
            onReply={() => handleReply(currentEmail)}
            onReplyAll={() => handleReply(currentEmail)}
            onForward={() => handleForward(currentEmail)}
            onDelete={() => {
              handleDelete([currentEmail.id])
              setCurrentEmail(null)
            }}
            onArchive={() => {
              handleArchive([currentEmail.id])
              setCurrentEmail(null)
            }}
          />
        </div>
      )}

      {/* Email Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowComposer(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <EmailComposer
                onClose={() => {
                  setShowComposer(false)
                  setReplyTo(null)
                  setForwardEmail(null)
                }}
                onSend={handleSendEmail}
                onSaveDraft={handleSaveDraft}
                replyTo={replyTo}
                forwardFrom={forwardEmail}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}