/**
 * @file components/email/EmailComposer.tsx
 * @description Rich text email composer with CC/BCC support
 * @author Team Kenya Dev
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
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
  Image,
  Smile,
  ChevronDown,
  Users
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'

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
  const [subject, setSubject] = useState(draftData?.subject || '')
  const [body, setBody] = useState(draftData?.body || '')
  const [attachments, setAttachments] = useState<File[]>([])
  const [showCc, setShowCc] = useState(cc.length > 0)
  const [showBcc, setShowBcc] = useState(bcc.length > 0)
  const [currentRecipient, setCurrentRecipient] = useState('')
  const [recipientType, setRecipientType] = useState<'to' | 'cc' | 'bcc'>('to')
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Email templates
  const templates = [
    { name: 'Welcome Email', subject: 'Welcome to FGC Kenya!', body: '<p>Dear Student,</p><p>Welcome to FIRST Global Challenge Team Kenya...</p>' },
    { name: 'Application Received', subject: 'Application Received - FGC Kenya', body: '<p>Thank you for your application...</p>' },
    { name: 'Interview Invitation', subject: 'Interview Invitation - FGC Kenya', body: '<p>Congratulations! You have been shortlisted...</p>' },
  ]

  useEffect(() => {
    if (replyTo) {
      setTo([replyTo.from])
      setSubject(`Re: ${replyTo.subject}`)
      setBody(`<br><br><hr><p>On ${replyTo.date}, ${replyTo.from} wrote:</p><blockquote>${replyTo.body}</blockquote>`)
    } else if (forwardFrom) {
      setSubject(`Fwd: ${forwardFrom.subject}`)
      setBody(`<br><br><hr><p>---------- Forwarded message ----------</p><p>From: ${forwardFrom.from}</p><p>Date: ${forwardFrom.date}</p><p>Subject: ${forwardFrom.subject}</p><br>${forwardFrom.body}`)
    }
  }, [replyTo, forwardFrom])

  const handleAddRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const email = currentRecipient.trim()
      if (email && email.includes('@')) {
        switch (recipientType) {
          case 'to':
            setTo([...to, email])
            break
          case 'cc':
            setCc([...cc, email])
            break
          case 'bcc':
            setBcc([...bcc, email])
            break
        }
        setCurrentRecipient('')
      }
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

  const handleSend = () => {
    if (to.length === 0) {
      alert('Please add at least one recipient')
      return
    }
    
    const emailData: EmailData = {
      to,
      cc,
      bcc,
      subject,
      body: editorRef.current?.innerHTML || body,
      attachments
    }
    
    onSend(emailData)
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

  const loadTemplate = (template: any) => {
    setSubject(template.subject)
    if (editorRef.current) {
      editorRef.current.innerHTML = template.body
    }
    setBody(template.body)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>New Message</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Templates <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {templates.map(template => (
                  <DropdownMenuItem key={template.name} onClick={() => loadTemplate(template)}>
                    {template.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Recipients */}
            <div className="space-y-2">
              {/* To */}
              <div className="flex items-center gap-2">
                <Label className="w-16">To:</Label>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {to.map(email => (
                      <Badge key={email} variant="secondary">
                        {email}
                        <button
                          onClick={() => removeRecipient(email, 'to')}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add recipients..."
                    value={recipientType === 'to' ? currentRecipient : ''}
                    onChange={(e) => {
                      setRecipientType('to')
                      setCurrentRecipient(e.target.value)
                    }}
                    onKeyDown={handleAddRecipient}
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCc(!showCc)}
                  >
                    Cc
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBcc(!showBcc)}
                  >
                    Bcc
                  </Button>
                </div>
              </div>

              {/* CC */}
              {showCc && (
                <div className="flex items-center gap-2">
                  <Label className="w-16">Cc:</Label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {cc.map(email => (
                        <Badge key={email} variant="secondary">
                          {email}
                          <button
                            onClick={() => removeRecipient(email, 'cc')}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add CC recipients..."
                      value={recipientType === 'cc' ? currentRecipient : ''}
                      onChange={(e) => {
                        setRecipientType('cc')
                        setCurrentRecipient(e.target.value)
                      }}
                      onKeyDown={handleAddRecipient}
                    />
                  </div>
                </div>
              )}

              {/* BCC */}
              {showBcc && (
                <div className="flex items-center gap-2">
                  <Label className="w-16">Bcc:</Label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {bcc.map(email => (
                        <Badge key={email} variant="secondary">
                          {email}
                          <button
                            onClick={() => removeRecipient(email, 'bcc')}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add BCC recipients..."
                      value={recipientType === 'bcc' ? currentRecipient : ''}
                      onChange={(e) => {
                        setRecipientType('bcc')
                        setCurrentRecipient(e.target.value)
                      }}
                      onKeyDown={handleAddRecipient}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center gap-2">
              <Label className="w-16">Subject:</Label>
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Rich Text Editor Toolbar */}
            <div className="border rounded-t-md p-2 flex items-center gap-1 flex-wrap bg-muted/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('bold')}
                className="h-8 w-8"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('italic')}
                className="h-8 w-8"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('underline')}
                className="h-8 w-8"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('insertUnorderedList')}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('insertOrderedList')}
                className="h-8 w-8"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('justifyLeft')}
                className="h-8 w-8"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('justifyCenter')}
                className="h-8 w-8"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => execCommand('justifyRight')}
                className="h-8 w-8"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const url = prompt('Enter URL:')
                  if (url) execCommand('createLink', url)
                }}
                className="h-8 w-8"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Email Body */}
            <div
              ref={editorRef}
              contentEditable
              className="border border-t-0 rounded-b-md p-4 min-h-[300px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: body }}
              onInput={(e) => setBody(e.currentTarget.innerHTML)}
              placeholder="Compose your email..."
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Attachments:</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="secondary">
                      <Paperclip className="mr-1 h-3 w-3" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {to.length + cc.length + bcc.length} recipients
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}