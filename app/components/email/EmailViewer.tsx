/**
 * @file components/email/EmailViewer.tsx
 * @description Email viewer component with reply/forward functionality
 * @author Team Kenya Dev
 */

'use client'

import { Card, CardContent, CardHeader } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { ScrollArea } from '@/app/components/ui/scroll-area'
import { Separator } from '@/app/components/ui/separator'
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
  Download
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { format } from 'date-fns'

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
}

export default function EmailViewer({
  email,
  onClose,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive
}: EmailViewerProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${email.subject}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
              .meta { color: #666; margin: 5px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${email.subject}</h2>
              <div class="meta">From: ${email.from}</div>
              <div class="meta">To: ${email.to.join(', ')}</div>
              <div class="meta">Date: ${format(new Date(email.sentAt || email.createdAt), 'PPpp')}</div>
            </div>
            <div>${email.body}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const downloadAttachment = (attachment: any) => {
    // In production, this would download from your storage service
    console.log('Downloading:', attachment.name)
  }

  return (
    <>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold mb-2">{email.subject || '(no subject)'}</h2>
          <div className="flex flex-wrap gap-2">
            {email.labels.map(label => (
              <Badge key={label} variant="secondary">{label}</Badge>
            ))}
            {email.isDraft && (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Star className={`h-4 w-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Move to folder</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Report spam</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Block sender</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {/* Email Metadata */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">From: </span>
                <span className="text-sm font-medium">{email.from}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">To: </span>
                <span className="text-sm">{email.to.join(', ')}</span>
              </div>
              {email.cc.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Cc: </span>
                  <span className="text-sm">{email.cc.join(', ')}</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {email.sentAt 
                ? format(new Date(email.sentAt), 'PPpp')
                : format(new Date(email.createdAt), 'PPpp')}
            </div>
          </div>

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Attachments ({email.attachments.length})</div>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((attachment, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAttachment(attachment)}
                  >
                    <Paperclip className="mr-1 h-3 w-3" />
                    {attachment.name}
                    <Download className="ml-2 h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Email Body */}
        <ScrollArea className="flex-1 p-4">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t flex items-center gap-2">
          <Button onClick={onReply}>
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </Button>
          <Button onClick={onReplyAll} variant="outline">
            <ReplyAll className="mr-2 h-4 w-4" />
            Reply All
          </Button>
          <Button onClick={onForward} variant="outline">
            <Forward className="mr-2 h-4 w-4" />
            Forward
          </Button>
          <div className="ml-auto flex gap-2">
            <Button onClick={onArchive} variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button onClick={onDelete} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  )
}