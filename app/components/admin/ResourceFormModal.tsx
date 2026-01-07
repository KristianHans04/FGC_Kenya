'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

interface ResourceFormModalProps {
  resource?: {
    slug: string
    title: string
    description?: string
    link: string
    cohort: string
  } | null
  onClose: () => void
}

export default function ResourceFormModal({ resource, onClose }: ResourceFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    cohort: 'FGC2025'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableCohorts, setAvailableCohorts] = useState<string[]>([])

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description || '',
        link: resource.link,
        cohort: resource.cohort
      })
    }
    
    // Generate cohort options (current year and past 5 years)
    const currentYear = new Date().getFullYear()
    const cohorts = []
    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
      cohorts.push(`FGC${year}`)
    }
    setAvailableCohorts(cohorts)
  }, [resource])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = resource 
        ? `/api/admin/resources/${resource.slug}`
        : '/api/admin/resources'
      
      const method = resource ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save resource')
      }
    } catch (error) {
      setError('An error occurred while saving')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {resource ? 'Edit Resource' : 'Add Learning Resource'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg"
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
              className="w-full px-3 py-2 bg-background border rounded-lg"
              rows={3}
              placeholder="Brief description of the resource..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Link *
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg"
              required
              placeholder="https://example.com/resource"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cohort *
            </label>
            <select
              value={formData.cohort}
              onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
              className="w-full px-3 py-2 bg-background border rounded-lg"
              required
            >
              {availableCohorts.map(cohort => (
                <option key={cohort} value={cohort}>
                  {cohort}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Select which cohort can access this resource
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {resource ? 'Update' : 'Create'} Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}