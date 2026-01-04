/**
 * @file components/email/EmailViewer.tsx
 * @description Email viewer component with improved UI and mobile responsiveness
 * Fixed: Theme colors, mobile layout, responsive design
 */

'use client'

import { useState } from 'react'
import { cn } from '@/app/lib/utils/cn'
import { formatDate } from '@/app/lib/utils/date'
import {
  X,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  Star,
  Paperclip,
  Printer,
  MoreVertical,
  Download,
  ArrowLeft,
  User,
  Clock,
  Mail
} from 'lucide-react'

interface EmailViewerProps {
  email: {
    id: string
    subject: string
    from: string
    to: string[]
    cc: string[]
    bcc: string[]
    body: string
    plainText: string
    isRead: boolean
    isStarred: boolean
    isDraft: boolean
    sentAt: string | null
    createdAt: string
    labels: string[]
    attachments: any[]
  }
  onClose: () => void
  onReply: () => void
  onReplyAll: () => void
  onForward: () => void
  onDelete: () => void
  onArchive: () => void
  onBack?: () => void
  isFullView?: boolean
}

export default function EmailViewer({
  email,
  onClose,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  onBack,
  isFullView
}: EmailViewerProps) {
  const [isStarred, setIsStarred] = useState(email.isStarred)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  
  const handlePrint = () => {
    window.print()
  }

  const handleStar = () => {
    setIsStarred(!isStarred)
    // API call to update star status would go here
  }

  const downloadAttachment = (attachment: any) => {
    console.log('Downloading:', attachment.name)
  }

  // Mobile full-screen view
  if (isFullView) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-muted/30">
          <button
            onClick={onBack || onClose}
            className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handleStar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={isStarred ? 'Unstar' : 'Star'}
            >
              <Star className={cn(
                "h-5 w-5",
                isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
              )} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => { onArchive(); setShowMoreMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => { handlePrint(); setShowMoreMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    Print
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-4">
            {/* Subject */}
            <h1 className="text-xl font-semibold text-foreground mb-4">
              {email.subject || '(no subject)'}
            </h1>

            {/* Sender Info with Background */}
            <div className="bg-muted/20 -m-4 p-4 mb-4 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{email.from}</div>
                  <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
                    <div className="flex gap-2">
                      <span className="font-medium">To:</span>
                      <span className="truncate">{email.to.join(', ')}</span>
                    </div>
                    {email.cc.length > 0 && (
                      <div className="flex gap-2">
                        <span className="font-medium">Cc:</span>
                        <span className="truncate">{email.cc.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(email.sentAt || email.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div 
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />

            {/* Attachments */}
            {email.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Attachments ({email.attachments.length})
                </h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <button
                      key={index}
                      onClick={() => downloadAttachment(attachment)}
                      className="flex items-center gap-3 w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-left text-sm text-foreground truncate">
                        {attachment.name}
                      </span>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex border-t-2 border-border bg-muted/20">
          <button
            onClick={onReply}
            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-muted transition-colors"
          >
            <Reply className="h-4 w-4" />
            <span className="text-sm font-medium">Reply</span>
          </button>
          <button
            onClick={onReplyAll}
            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-muted transition-colors border-l border-border"
          >
            <ReplyAll className="h-4 w-4" />
            <span className="text-sm font-medium">Reply All</span>
          </button>
          <button
            onClick={onForward}
            className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-muted transition-colors border-l border-border"
          >
            <Forward className="h-4 w-4" />
            <span className="text-sm font-medium">Forward</span>
          </button>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border bg-card shadow-sm">
        <h2 className="text-lg font-semibold text-foreground truncate max-w-[60%]">
          {email.subject || '(no subject)'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStar}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label={isStarred ? 'Unstar' : 'Star'}
          >
            <Star className={cn(
              "h-5 w-5",
              isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
            )} />
          </button>
          <button
            onClick={onArchive}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Archive"
          >
            <Archive className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Print"
          >
            <Printer className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Sender Information Section with Different Background */}
        <div className="bg-card border-b border-border px-6 py-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{email.from}</h3>
                  <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    <div className="flex gap-2">
                      <span className="font-medium min-w-8">To:</span>
                      <span>{email.to.join(', ')}</span>
                    </div>
                    {email.cc.length > 0 && (
                      <div className="flex gap-2">
                        <span className="font-medium min-w-8">Cc:</span>
                        <span>{email.cc.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(email.sentAt || email.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Email Body Content */}
        <div className="px-6 py-6 bg-white dark:bg-card/50">

          {/* Labels */}
          {email.labels && email.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {email.labels.map(label => (
                <span
                  key={label}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Email Body */}
          <div 
            className="prose prose-sm max-w-none text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className="mt-8 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">
                Attachments ({email.attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {email.attachments.map((attachment, index) => (
                  <button
                    key={index}
                    onClick={() => downloadAttachment(attachment)}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                  >
                    <Paperclip className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm text-foreground truncate">
                      {attachment.name}
                    </span>
                    <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t-2 border-border bg-card shadow-sm flex items-center gap-3">
        <button
          onClick={onReply}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <Reply className="h-4 w-4" />
          Reply
        </button>
        <button
          onClick={onReplyAll}
          className="px-4 py-2.5 border border-border hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
        >
          <ReplyAll className="h-4 w-4" />
          Reply All
        </button>
        <button
          onClick={onForward}
          className="px-4 py-2.5 border border-border hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
        >
          <Forward className="h-4 w-4" />
          Forward
        </button>
      </div>
    </div>
  )
}