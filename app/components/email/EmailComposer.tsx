/**
 * @file components/email/EmailComposer.tsx
 * @description Rich text email composer with proper UI/UX
 * Fixed: RTL text issue, multiple recipients, mobile responsiveness, theme colors
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/app/lib/utils/cn'
import {
  X,
  Send,
  Save,
  Paperclip,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  ChevronDown,
  FileText,
  Minimize2,
  Maximize2,
  AlertCircle
} from 'lucide-react'

interface EmailComposerProps {
  onClose: () => void
  onSend: (email: EmailData) => void
  onSaveDraft: (email: EmailData) => void
  replyTo?: any
  forwardFrom?: any
  draftData?: any
}

interface EmailData {
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  body: string
  attachments: File[]
}

export default function EmailComposer({
  onClose,
  onSend,
  onSaveDraft,
  replyTo,
  forwardFrom,
  draftData
}: EmailComposerProps) {
  const [to, setTo] = useState<string[]>(draftData?.to || [])
  const [cc, setCc] = useState<string[]>(draftData?.cc || [])
  const [bcc, setBcc] = useState<string[]>(draftData?.bcc || [])
  const [toInput, setToInput] = useState('')
  const [ccInput, setCcInput] = useState('')
  const [bccInput, setBccInput] = useState('')
  const [subject, setSubject] = useState(draftData?.subject || '')
  const [body, setBody] = useState(draftData?.body || '')
  const [attachments, setAttachments] = useState<File[]>([])
  const [showCc, setShowCc] = useState(cc.length > 0)
  const [showBcc, setShowBcc] = useState(bcc.length > 0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (replyTo) {
      const replyEmail = replyTo.sender?.email || replyTo.from || replyTo.sender
      setTo([replyEmail])
      setSubject(`Re: ${replyTo.subject}`)
    } else if (forwardFrom) {
      setSubject(`Fwd: ${forwardFrom.subject}`)
    }
  }, [replyTo, forwardFrom])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAddRecipient = (input: string, type: 'to' | 'cc' | 'bcc') => {
    const emails = input.split(/[,;\s]+/).filter(e => e.length > 0)
    const validEmails: string[] = []
    const invalidEmails: string[] = []

    emails.forEach(email => {
      const trimmed = email.trim()
      if (trimmed && validateEmail(trimmed)) {
        validEmails.push(trimmed)
      } else if (trimmed) {
        invalidEmails.push(trimmed)
      }
    })

    if (validEmails.length > 0) {
      switch (type) {
        case 'to':
          setTo([...new Set([...to, ...validEmails])])
          setToInput('')
          break
        case 'cc':
          setCc([...new Set([...cc, ...validEmails])])
          setCcInput('')
          break
        case 'bcc':
          setBcc([...new Set([...bcc, ...validEmails])])
          setBccInput('')
          break
      }
    }

    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, type: 'to' | 'cc' | 'bcc') => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = type === 'to' ? toInput : type === 'cc' ? ccInput : bccInput
      handleAddRecipient(input, type)
    }
  }

  const removeRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    switch (type) {
      case 'to':
        setTo(to.filter(e => e !== email))
        break
      case 'cc':
        setCc(cc.filter(e => e !== email))
        break
      case 'bcc':
        setBcc(bcc.filter(e => e !== email))
        break
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments([...attachments, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    setError('')
    
    if (to.length === 0) {
      setError('Please add at least one recipient')
      return
    }
    
    setIsSending(true)
    const emailData: EmailData = {
      to,
      cc,
      bcc,
      subject: subject || '(no subject)',
      body: editorRef.current?.innerHTML || body,
      attachments
    }
    
    try {
      await onSend(emailData)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = () => {
    const emailData: EmailData = {
      to,
      cc,
      bcc,
      subject,
      body: editorRef.current?.innerHTML || body,
      attachments
    }
    
    onSaveDraft(emailData)
  }

  const RecipientBadge = ({ email, type }: { email: string; type: 'to' | 'cc' | 'bcc' }) => (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
      <span className="max-w-[150px] truncate">{email}</span>
      <button
        onClick={() => removeRecipient(email, type)}
        className="hover:text-red-600 transition-colors"
        aria-label={`Remove ${email}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )

  return (
    <div className={cn(
      "h-full flex flex-col bg-card",
      "rounded-xl shadow-2xl"
    )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border bg-muted/30 rounded-t-xl shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            {replyTo ? 'Reply' : forwardFrom ? 'Forward' : 'New Message'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:block p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Recipients Section */}
        <div className="px-6 py-4 space-y-3 border-b border-border bg-background shrink-0">
          {/* To Field */}
          <div className="flex items-start gap-2">
            <label className="w-12 text-sm font-medium text-muted-foreground pt-2">To:</label>
            <div className="flex-1 space-y-2">
              {to.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {to.map((email) => (
                    <RecipientBadge key={`to-${email}`} email={email} type="to" />
                  ))}
                </div>
              )}
              <input
                type="text"
                placeholder="Add recipients (press Enter or comma to add)"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'to')}
                onBlur={() => toInput && handleAddRecipient(toInput, 'to')}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                dir="ltr"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowCc(!showCc)}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  showCc ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                Cc
              </button>
              <button
                onClick={() => setShowBcc(!showBcc)}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  showBcc ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
              >
                Bcc
              </button>
            </div>
          </div>

          {/* CC Field */}
          {showCc && (
            <div className="flex items-start gap-2">
              <label className="w-12 text-sm font-medium text-muted-foreground pt-2">Cc:</label>
              <div className="flex-1 space-y-2">
                {cc.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cc.map((email) => (
                      <RecipientBadge key={`cc-${email}`} email={email} type="cc" />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Add CC recipients"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'cc')}
                  onBlur={() => ccInput && handleAddRecipient(ccInput, 'cc')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* BCC Field */}
          {showBcc && (
            <div className="flex items-start gap-2">
              <label className="w-12 text-sm font-medium text-muted-foreground pt-2">Bcc:</label>
              <div className="flex-1 space-y-2">
                {bcc.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bcc.map((email) => (
                      <RecipientBadge key={`bcc-${email}`} email={email} type="bcc" />
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Add BCC recipients"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                  onBlur={() => bccInput && handleAddRecipient(bccInput, 'bcc')}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center gap-2">
            <label className="w-12 text-sm font-medium text-muted-foreground">Subject:</label>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              dir="ltr"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-border bg-muted/10 flex items-center gap-1 flex-wrap shrink-0">
          <button
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Underline"
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Bullet list"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => execCommand('justifyLeft')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-muted rounded transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Message Body */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-75 p-6 text-foreground focus:outline-none"
            data-placeholder="Write your message..."
            dir="ltr"
            style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}
            onInput={(e) => setBody(e.currentTarget.innerHTML)}
            suppressContentEditableWarning={true}
          >
            {body === '' && (
              <span className="text-muted-foreground">Write your message...</span>
            )}
          </div>
          
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="max-w-50 truncate">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t-2 border-border bg-muted/20 flex items-center justify-between shrink-0 rounded-b-xl">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Save draft
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || to.length === 0}
              className={cn(
                "px-4 py-2 text-sm rounded-lg font-medium transition-colors",
                "bg-primary text-white hover:bg-primary-light",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center gap-2"
              )}
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
    </div>
  )
}