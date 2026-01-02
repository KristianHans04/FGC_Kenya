/**
 * @file app/components/media/RichTextEditor.tsx
 * @description Rich text editor component with Beehiiv-like functionality
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus
} from 'lucide-react'
import { cn } from '@/app/lib/utils/cn'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your article...',
  className,
  minHeight = '400px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [selectedText, setSelectedText] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const formatBlock = (tag: string) => {
    executeCommand('formatBlock', tag)
  }

  const insertLink = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      setSelectedText(selection.toString())
      setShowLinkDialog(true)
    } else {
      alert('Please select text to convert to a link')
    }
  }

  const applyLink = () => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl)
      setShowLinkDialog(false)
      setLinkUrl('')
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      executeCommand('insertImage', url)
    }
  }

  const insertHorizontalRule = () => {
    executeCommand('insertHorizontalRule')
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
    active = false
  }: {
    onClick: () => void
    icon: any
    title: string
    active?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-muted transition-colors",
        active && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-card", className, isFullscreen && "fixed inset-0 z-50")}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('bold')}
            icon={Bold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => executeCommand('italic')}
            icon={Italic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => executeCommand('underline')}
            icon={Underline}
            title="Underline (Ctrl+U)"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => formatBlock('h1')}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => formatBlock('h2')}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => formatBlock('h3')}
            icon={Heading3}
            title="Heading 3"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('justifyLeft')}
            icon={AlignLeft}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => executeCommand('justifyCenter')}
            icon={AlignCenter}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => executeCommand('justifyRight')}
            icon={AlignRight}
            title="Align Right"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={() => executeCommand('insertUnorderedList')}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => executeCommand('insertOrderedList')}
            icon={ListOrdered}
            title="Numbered List"
          />
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <ToolbarButton
            onClick={insertLink}
            icon={Link2}
            title="Insert Link"
          />
          <ToolbarButton
            onClick={insertImage}
            icon={Image}
            title="Insert Image"
          />
          <ToolbarButton
            onClick={() => formatBlock('blockquote')}
            icon={Quote}
            title="Quote"
          />
          <ToolbarButton
            onClick={() => formatBlock('pre')}
            icon={Code}
            title="Code Block"
          />
          <ToolbarButton
            onClick={insertHorizontalRule}
            icon={Minus}
            title="Horizontal Rule"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => executeCommand('undo')}
            icon={Undo}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => executeCommand('redo')}
            icon={Redo}
            title="Redo (Ctrl+Y)"
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "p-4 focus:outline-none prose prose-sm max-w-none",
          "text-foreground",
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4",
          "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3",
          "[&_h3]:text-xl [&_h3]:font-medium [&_h3]:mb-2",
          "[&_p]:mb-4",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto",
          "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
          "[&_a]:text-primary [&_a]:underline",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4",
          "[&_li]:mb-1",
          "[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4",
          "[&_hr]:my-6 [&_hr]:border-border"
        )}
        style={{ minHeight }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Selected text: "{selectedText}"
            </p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                }}
                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  )
}