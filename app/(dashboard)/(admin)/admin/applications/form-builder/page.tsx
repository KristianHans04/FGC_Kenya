'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ApplicationFormBuilder = dynamic(
  () => import('@/app/components/admin/ApplicationFormBuilder'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form builder...</p>
        </div>
      </div>
    )
  }
)

export default function FormBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formId = searchParams.get('id')
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(!!formId)

  useEffect(() => {
    document.title = 'Form Builder | FIRST Global Team Kenya'
    
    if (formId) {
      fetchFormData()
    }
  }, [formId])

  const fetchFormData = async () => {
    try {
      const response = await fetch(`/api/applications/forms/${formId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(data.data.form)
      } else {
        console.error('Failed to fetch form data')
        // Still allow creating new form even if fetching fails
      }
    } catch (error) {
      console.error('Error fetching form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    try {
      const url = formId 
        ? `/api/applications/forms/${formId}`
        : '/api/applications/forms'
      
      const response = await fetch(url, {
        method: formId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          isDraft: false // Mark as no longer a draft when saved
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Show success message
        const message = formId 
          ? 'Application form updated successfully'
          : 'Application form created successfully'
        
        // If it's a new form and was created successfully, update the URL
        if (!formId && result.data?.form?.id) {
          router.replace(`/admin/applications/form-builder?id=${result.data.form.id}`)
        }
        
        // Navigate back to applications page after a short delay
        setTimeout(() => {
          router.push('/admin/applications')
        }, 1500)
      } else {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to save form')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      throw error // Let the component handle the error display
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/admin/applications')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="px-4 py-3">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </div>
      </div>
      
      {/* Form Builder Component - Full height */}
      <div className="h-[calc(100vh-57px)]">
        <ApplicationFormBuilder
          initialData={formData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}