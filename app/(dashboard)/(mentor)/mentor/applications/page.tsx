'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Lock
} from 'lucide-react'
import { useFlashNotification } from '@/app/lib/hooks/useFlashNotification'

interface ApplicationAccess {
  hasAccess: boolean
  cohort: string
  grantedAt?: string
  expiresAt?: string
  remainingDays?: number
  message?: string
  applicationForm?: {
    id: string
    slug: string
    season: string
    title: string
    openDate: string
    closeDate: string
  }
}

export default function MentorApplicationsPage() {
  useEffect(() => {
    document.title = 'Application Review | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Review and provide feedback on student applications')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Review and provide feedback on student applications'
      document.head.appendChild(meta)
    }
  }, [])

  const router = useRouter()
  const { addNotification } = useFlashNotification()
  const [access, setAccess] = useState<ApplicationAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkApplicationAccess()
  }, [])

  const checkApplicationAccess = async () => {
    try {
      const response = await fetch('/api/mentor/applications/access')
      const data = await response.json()
      
      if (data.success) {
        setAccess(data.data)
        
        // Show notification if access is expiring soon
        if (data.data.hasAccess && data.data.remainingDays && data.data.remainingDays <= 3) {
          addNotification(
            `Your application review access expires in ${data.data.remainingDays} day${data.data.remainingDays > 1 ? 's' : ''}`,
            'warning'
          )
        }
      } else {
        addNotification(
          'Failed to check application access',
          'error'
        )
      }
    } catch (error) {
      console.error('Error checking application access:', error)
      addNotification(
        'Failed to check application access',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!access) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-card rounded-lg border">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Access Information</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  if (!access.hasAccess) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-card rounded-lg border">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Application Review Access</h2>
          <p className="text-muted-foreground mb-6">
            {access.message || 'You do not currently have permission to review applications.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Contact an administrator if you believe you should have access.
          </p>
        </div>
      </div>
    )
  }

  const { applicationForm } = access

  if (!applicationForm) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-card rounded-lg border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Application Call</h2>
          <p className="text-muted-foreground">
            There is no active application call for the {access.cohort} cohort.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Application Review</h1>
        <p className="text-muted-foreground">
          Review and provide feedback on {access.cohort} applications
        </p>
      </div>

      {/* Access Information */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Review Access</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Active review access for {access.cohort}</span>
              </div>
              
              {access.grantedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Granted on {new Date(access.grantedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {access.expiresAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600">
                    Expires on {new Date(access.expiresAt).toLocaleDateString()}
                    {access.remainingDays && access.remainingDays <= 7 && (
                      <span className="ml-1 font-medium">
                        ({access.remainingDays} day{access.remainingDays > 1 ? 's' : ''} remaining)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Information */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Application Call Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{applicationForm.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Season</p>
            <p className="font-medium">{applicationForm.season}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Open Date</p>
            <p className="font-medium">{new Date(applicationForm.openDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Close Date</p>
            <p className="font-medium">{new Date(applicationForm.closeDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Link
          href={`/mentor/applications/${applicationForm.slug}`}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Review Applications
        </Link>
      </div>
    </div>
  )
}