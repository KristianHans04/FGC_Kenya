'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Image, Video, FileText, X } from 'lucide-react'

export default function CreateMediaPage() {
  useEffect(() => {
    document.title = 'Upload Media | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Upload new media content to the library')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Upload new media content to the library'
      document.head.appendChild(meta)
    }
  }, [])

  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'image' | 'video' | 'document'>('image')
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('type', type)
      formData.append('tags', JSON.stringify(tags))

      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        router.push('/admin/media')
      }
    } catch (error) {
      console.error('Failed to upload media:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/media"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Upload Media</h1>
              <p className="text-muted-foreground">Add new media to the library</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-card rounded-lg border p-6 space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                File <span className="text-destructive">*</span>
              </label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, MP4, PDF up to 50MB
                    </p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*,video/*,application/pdf"
                      required
                    />
                  </>
                )}
              </div>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Media Type <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setType('image')}
                  className={`p-4 rounded-lg border ${
                    type === 'image'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Image className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Image</p>
                </button>
                <button
                  type="button"
                  onClick={() => setType('video')}
                  className={`p-4 rounded-lg border ${
                    type === 'video'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Video className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Video</p>
                </button>
                <button
                  type="button"
                  onClick={() => setType('document')}
                  className={`p-4 rounded-lg border ${
                    type === 'document'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Document</p>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Enter media title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Enter media description (optional)"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Add tags..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file || !title}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Media'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}