/**
 * @file app/(dashboard)/(admin)/admin/applications/page.tsx
 * @description Applications management page with Google Forms-style UI
 * @author Team Kenya Dev
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Plus,
  RefreshCw,
  Users,
  Rocket,
  Star,
  Award,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ApplicationFormsList from '@/app/components/admin/ApplicationFormsList'
import { showError } from '@/app/lib/hooks/useFlashNotification'

interface ApplicationForm {
  id: string
  season: string
  title: string
  description?: string
  openDate: string
  closeDate: string
  isActive: boolean
  isDraft: boolean
  applicationCount?: number
  createdAt: string
  updatedAt: string
  createdBy?: {
    email: string
    firstName?: string
    lastName?: string
  }
}

export default function ApplicationsManagementPage() {
  useEffect(() => {
    document.title = 'Applications Management | FIRST Global Team Kenya'
  }, [])

  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [applicationForms, setApplicationForms] = useState<ApplicationForm[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeForms: 0,
    totalShortlisted: 0,
    totalAccepted: 0
  })

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    fetchApplicationForms()
  }, [])

  const fetchApplicationForms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/applications/forms', {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        const forms = data.data?.forms || []
        setApplicationForms(forms)
        
        // Calculate statistics
        const calculatedStats = {
          totalApplications: forms.reduce((sum: number, form: ApplicationForm) => 
            sum + (form.applicationCount || 0), 0),
          activeForms: forms.filter((f: ApplicationForm) => f.isActive).length,
          totalShortlisted: 0, // This would come from a different API
          totalAccepted: 0 // This would come from a different API
        }
        setStats(calculatedStats)
      } else {
        const error = await response.json()
        showError(error.error?.message || 'Failed to fetch application forms')
      }
    } catch (error) {
      console.error('Failed to fetch application forms:', error)
      showError('Failed to fetch application forms')
    } finally {
      setLoading(false)
    }
  }

  const handleEditForm = (form: ApplicationForm) => {
    router.push(`/admin/applications/form-builder?id=${form.id}`)
  }

  const handleDeleteForm = (formId: string) => {
    setApplicationForms(prev => prev.filter(f => f.id !== formId))
  }

  const handleDuplicateForm = () => {
    // This will be handled by the component itself
    fetchApplicationForms()
  }

  const handleToggleActive = (formId: string, active: boolean) => {
    setApplicationForms(prev => prev.map(f => {
      if (f.id === formId) {
        return { ...f, isActive: active }
      }
      // If activating this form, deactivate others
      if (active && f.id !== formId) {
        return { ...f, isActive: false }
      }
      return f
    }))
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary via-primary to-green-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Applications Hub</h1>
              </div>
              <p className="text-white/90 max-w-xl">
                Manage application forms, review candidates, and build the next generation of STEM leaders for Team Kenya.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/applications/form-builder"
                className="px-5 py-2.5 bg-white text-primary rounded-lg flex items-center gap-2 hover:bg-white/90 transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Create New Form
              </Link>
              
              <button
                onClick={fetchApplicationForms}
                className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-lg flex items-center gap-2 hover:bg-white/30 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Application Forms List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ApplicationFormsList
            forms={applicationForms}
            onRefresh={fetchApplicationForms}
            onEdit={handleEditForm}
            onDelete={handleDeleteForm}
            onDuplicate={handleDuplicateForm}
            onToggleActive={handleToggleActive}
          />
        </motion.div>
      </div>
    </div>
  )
}