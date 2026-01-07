'use client'

import { useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'

interface ResourceFormProps {
  resource?: {
    id: string
    title: string
    description?: string
    link: string
    cohort: string
  } | null
  cohorts: string[]
  onClose: () => void
  onSuccess: () => void
}

export default function ResourceForm({ resource, cohorts, onClose, onSuccess }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    link: resource?.link || '',
    cohort: resource?.cohort || cohorts[0] || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = resource 
        ? `/api/admin/resources/${resource.id}`
        : '/api/admin/resources'
      
      const method = resource ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save resource')
      }
    } catch (error) {
      console.error('Failed to save resource:', error)
      setError('Failed to save resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="e.g., Bill of Materials"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Brief description of the resource..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cohort <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.cohort}
              onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              required
            >
              {cohorts.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {resource ? 'Update' : 'Create'} Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}