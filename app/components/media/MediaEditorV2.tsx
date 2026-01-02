/**
 * @file app/components/media/MediaEditorV2.tsx
 * @description Comprehensive media editor with rich text, drafts, and Beehiiv-like experience
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from './RichTextEditor'
import { cn } from '@/app/lib/utils/cn'
import {
  Save,
  Send,
  X,
  Upload,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  FileText,
  Tag
} from 'lucide-react'

interface MediaEditorProps {
  article?: {
    id?: string
    title: string
    excerpt: string
    content: string
    coverImage?: string
    tags: string[]
    status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED'
  }
  onSave: (data: any, isDraft: boolean) => Promise<void>
  onClose: () => void
  userRole?: string
}

export default function MediaEditorV2({
  article,
  onSave,
  onClose,
  userRole = 'ADMIN'
}: MediaEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(article?.title || '')
  const [excerpt, setExcerpt] = useState(article?.excerpt || '')
  const [content, setContent] = useState(article?.content || '')
  const [coverImage, setCoverImage] = useState(article?.coverImage || '')
  const [tags, setTags] = useState<string[]>(article?.tags || [])
  const [tagInput, setTagInput] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (title || content) {
        handleAutoSave()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer)
  }, [title, excerpt, content, coverImage, tags])

  const handleAutoSave = async () => {
    if (!title && !content) return
    
    setAutoSaving(true)
    try {
      await onSave({
        title: title || 'Untitled',
        excerpt,
        content,
        coverImage,
        tags,
        status: 'DRAFT'
      }, true)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setAutoSaving(false)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }
    if (!excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required'
    }
    if (excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters'
    }
    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveAsDraft = async () => {
    setSaving(true)
    try {
      await onSave({
        title: title || 'Untitled',
        excerpt,
        content,
        coverImage,
        tags,
        status: 'DRAFT'
      }, true)
      onClose()
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      const status = userRole === 'STUDENT' ? 'PENDING_REVIEW' : 'PUBLISHED'
      await onSave({
        title,
        excerpt,
        content,
        coverImage,
        tags,
        status
      }, false)
      onClose()
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, upload to cloud storage
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  if (previewMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Preview</h2>
            <button
              onClick={() => setPreviewMode(false)}
              className="btn-secondary"
            >
              Back to Editor
            </button>
          </div>
          
          <article className="prose prose-lg max-w-none">
            {coverImage && (
              <img
                src={coverImage}
                alt={title}
                className="w-full h-96 object-cover rounded-lg mb-8"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{title || 'Untitled'}</h1>
            <p className="text-xl text-muted-foreground mb-8">{excerpt}</p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {article ? 'Edit Article' : 'Create Article'}
              </h2>
              {autoSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </div>
              )}
              {!autoSaving && lastSaved && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={handleSaveAsDraft}
                disabled={saving}
                className="btn-secondary flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {userRole === 'STUDENT' ? 'Submit for Review' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article Title"
                className={cn(
                  "w-full text-4xl font-bold bg-transparent border-none outline-none placeholder-muted-foreground/50",
                  errors.title && "text-red-500"
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your article..."
                rows={2}
                className={cn(
                  "w-full text-lg bg-transparent border-none outline-none resize-none placeholder-muted-foreground/50",
                  errors.excerpt && "text-red-500"
                )}
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.excerpt}
                </p>
              )}
            </div>

            {/* Cover Image */}
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setCoverImage('')}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload cover image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={addTag}
                  className="btn-secondary"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                minHeight="500px"
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.content}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}