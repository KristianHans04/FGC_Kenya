/**
 * @file app/(dashboard)/(admin)/admin/emails/[folder]/[id]/page.tsx
 * @description Individual email viewer page with slug-based routing
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EmailViewer from '@/app/components/email/EmailViewer'
import EmailComposer from '@/app/components/email/EmailComposer'
import { Loader2 } from 'lucide-react'

interface Email {
  id: string
  subject: string
  body: string
  plainText: string
  from: string
  to: string[]
  cc: string[]
  bcc: string[]
  isRead: boolean
  isStarred: boolean
  isDraft: boolean
  sentAt: string | null
  createdAt: string
  labels: string[]
  attachments: any[]
}

export default function EmailPage() {
  const params = useParams()
  const router = useRouter()
  const [email, setEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [replyMode, setReplyMode] = useState<'reply' | 'replyAll' | 'forward' | null>(null)

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const response = await fetch(`/api/admin/emails?id=${params.id}`)
        if (response.ok) {
          const result = await response.json()
          const emailData = result.data.email
          
          // Transform to match EmailViewer interface
          setEmail({
            ...emailData,
            from: emailData.sender?.email || '',
            to: emailData.toEmails || [],
            cc: emailData.ccEmails || [],
            bcc: emailData.bccEmails || [],
            plainText: emailData.plainText || ''
          })
        } else {
          setError('Email not found')
        }
      } catch (err) {
        console.error('Failed to fetch email:', err)
        setError('Failed to load email')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEmail()
    }
  }, [params.id])

  const handleReply = () => {
    setReplyMode('reply')
    setShowComposer(true)
  }

  const handleReplyAll = () => {
    setReplyMode('replyAll')
    setShowComposer(true)
  }

  const handleForward = () => {
    setReplyMode('forward')
    setShowComposer(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !email) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <p className="text-muted-foreground mb-4">{error || 'Email not found'}</p>
        <button
          onClick={() => router.push(`/admin/emails/${params.folder}`)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
        >
          Back to {params.folder}
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <EmailViewer
        email={email}
        isFullView
        onBack={() => router.push(`/admin/emails/${params.folder}`)}
        onClose={() => router.push(`/admin/emails/${params.folder}`)}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onDelete={async () => {
          await fetch('/api/admin/emails', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailId: email.id, isDeleted: true })
          })
          router.push(`/admin/emails/${params.folder}`)
        }}
        onArchive={async () => {
          await fetch('/api/admin/emails', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailId: email.id, isArchived: true })
          })
          router.push(`/admin/emails/${params.folder}`)
        }}
      />

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden ring-1 ring-border">
            <EmailComposer
              replyTo={replyMode === 'reply' || replyMode === 'replyAll' ? email : undefined}
              forwardFrom={replyMode === 'forward' ? email : undefined}
              onClose={() => {
                setShowComposer(false)
                setReplyMode(null)
              }}
              onSend={async (data) => {
                try {
                  const response = await fetch('/api/admin/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  })
                  
                  if (response.ok) {
                    setShowComposer(false)
                    setReplyMode(null)
                    router.push(`/admin/emails/${params.folder}`)
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
                    setReplyMode(null)
                  }
                } catch (error) {
                  console.error('Error saving draft:', error)
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
