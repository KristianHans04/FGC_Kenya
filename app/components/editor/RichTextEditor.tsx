'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Undo,
  Redo,
  ChevronDown
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  minHeight?: string
  onImageUpload?: (file: File) => Promise<string>
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing your story...',
  className = '',
  readOnly = false,
  minHeight = '400px',
  onImageUpload
}: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Color,
      Highlight.configure({
        multicolor: true
      })
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      if (onImageUpload) {
        try {
          const url = await onImageUpload(file)
          editor?.chain().focus().setImage({ src: url }).run()
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      } else {
        // Fallback to base64 if no upload handler
        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          editor?.chain().focus().setImage({ src: url }).run()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const addLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkModalOpen(false)
    }
  }

  if (!editor) {
    return (
      <div className={`border rounded-lg p-4 bg-muted animate-pulse ${className}`} style={{ minHeight }}>
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {!readOnly && (
        <div className="border-b bg-muted/50 p-2">
          <div className="flex flex-wrap gap-1">
            {/* Text Style */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('bold') ? 'bg-muted text-primary' : ''
                }`}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('italic') ? 'bg-muted text-primary' : ''
                }`}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('underline') ? 'bg-muted text-primary' : ''
                }`}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('paragraph') ? 'bg-muted text-primary' : ''
                }`}
                title="Paragraph"
              >
                <Type className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : ''
                }`}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : ''
                }`}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-muted text-primary' : ''
                }`}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('bulletList') ? 'bg-muted text-primary' : ''
                }`}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('orderedList') ? 'bg-muted text-primary' : ''
                }`}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('blockquote') ? 'bg-muted text-primary' : ''
                }`}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive('code') ? 'bg-muted text-primary' : ''
                }`}
                title="Code"
              >
                <Code className="h-4 w-4" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-muted text-primary' : ''
                }`}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-muted text-primary' : ''
                }`}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-muted text-primary' : ''
                }`}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-1.5 rounded hover:bg-muted ${
                  editor.isActive({ textAlign: 'justify' }) ? 'bg-muted text-primary' : ''
                }`}
                title="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* Insert */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(true)}
                className="p-1.5 rounded hover:bg-muted"
                title="Add Link"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleImageUpload}
                className="p-1.5 rounded hover:bg-muted"
                title="Add Image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>

            {/* History */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 focus:outline-none"
        style={{ minHeight }}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLinkModalOpen(false)
                  setLinkUrl('')
                }}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}