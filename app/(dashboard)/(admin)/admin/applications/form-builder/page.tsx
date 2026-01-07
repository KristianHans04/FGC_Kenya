'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { showSuccess, showError } from '@/app/lib/hooks/useFlashNotification'

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
    console.log('[Form Save] Starting save process', {
      formId,
      hasTitle: !!data.title,
      hasSeason: !!data.season,
      method: formId ? 'UPDATE' : 'CREATE'
    })
    
    try {
      const url = formId 
        ? `/api/applications/forms/${formId}`
        : '/api/applications/forms'
      
      console.log('[Form Save] Making request to:', url)
      
      const response = await fetch(url, {
        method: formId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          isDraft: false // Mark as no longer a draft when saved
        })
      })
      
      console.log('[Form Save] Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('[Form Save] Success:', result)
        
        // Show success message
        const message = formId 
          ? 'Application form updated successfully'
          : 'Application form created successfully'
        
        showSuccess(message)
        
        // If it's a new form and was created successfully, update the URL
        if (!formId && result.data?.form?.id) {
          console.log('[Form Save] Updating URL with new form ID:', result.data.form.id)
          router.replace(`/admin/applications/form-builder?id=${result.data.form.id}`)
        }
        
        // Navigate back to applications page after a short delay
        setTimeout(() => {
          router.push('/admin/applications')
        }, 2000)
      } else {
        const errorData = await response.json()
        console.error('[Form Save] Error response:', errorData)
        
        // Extract specific error message
        let errorMessage = 'Failed to save form'
        if (errorData.error?.code === 'SEASON_EXISTS') {
          errorMessage = errorData.error.message
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }
        
        showError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('Error saving form:', error)
      // Don't throw the error object, just the message string
      if (typeof error === 'object' && error.message) {
        if (!error.message.includes('Failed to save form')) {
          showError(error.message)
        }
        throw new Error(error.message)
      } else if (typeof error === 'string') {
        showError(error)
        throw new Error(error)
      } else {
        showError('An unexpected error occurred')
        throw new Error('An unexpected error occurred')
      }
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