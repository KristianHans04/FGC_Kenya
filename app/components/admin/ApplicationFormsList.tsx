'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Archive,
  Eye,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { format, differenceInDays, isAfter } from 'date-fns'
import { cn } from '@/app/lib/utils'
import { showSuccess, showError, showWarning } from '@/app/lib/hooks/useFlashNotification'

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

interface ApplicationFormsListProps {
  forms: ApplicationForm[]
  onRefresh: () => void
  onEdit: (form: ApplicationForm) => void
  onDelete: (formId: string) => void
  onDuplicate: (form: ApplicationForm) => void
  onToggleActive: (formId: string, active: boolean) => void
}

export default function ApplicationFormsList({
  forms,
  onRefresh,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive
}: ApplicationFormsListProps) {
  const [selectedForm, setSelectedForm] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/applications/forms/${formId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        showSuccess('Form deleted successfully')
        onDelete(formId)
      } else {
        const error = await response.json()
        showError(error.error?.message || 'Failed to delete form')
      }
    } catch (error) {
      showError('Failed to delete form')
    }
  }

  const handleToggleActive = async (form: ApplicationForm) => {
    const newStatus = !form.isActive
    
    if (newStatus && !confirm('Activating this form will deactivate all other forms. Continue?')) {
      return
    }

    try {
      const response = await fetch(`/api/applications/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          isActive: newStatus,
          isDraft: false
        })
      })

      if (response.ok) {
        showSuccess(newStatus ? 'Form activated successfully' : 'Form deactivated successfully')
        onToggleActive(form.id, newStatus)
        onRefresh()
      } else {
        const error = await response.json()
        showError(error.error?.message || 'Failed to update form status')
      }
    } catch (error) {
      showError('Failed to update form status')
    }
  }

  const handleDuplicate = async (form: ApplicationForm) => {
    const nextYear = new Date().getFullYear() + 1
    const newSeason = form.season.includes('2025') 
      ? form.season.replace('2025', String(nextYear))
      : `${form.season}-${nextYear}`

    try {
      const response = await fetch('/api/applications/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          id: undefined,
          season: newSeason,
          title: form.title.includes('2025') 
            ? form.title.replace('2025', String(nextYear))
            : `${form.title} (Copy)`,
          isActive: false,
          isDraft: true,
          applicationCount: 0,
          createdAt: undefined,
          updatedAt: undefined
        })
      })

      if (response.ok) {
        showSuccess('Form duplicated successfully')
        onRefresh()
      } else {
        const error = await response.json()
        showError(error.error?.message || 'Failed to duplicate form')
      }
    } catch (error) {
      showError('Failed to duplicate form')
    }
  }

  const getFormStatus = (form: ApplicationForm) => {
    const now = new Date()
    const openDate = new Date(form.openDate)
    const closeDate = new Date(form.closeDate)

    if (form.isDraft) {
      return { label: 'Draft', color: 'text-muted-foreground bg-muted', icon: Edit2 }
    }
    if (!form.isActive) {
      return { label: 'Inactive', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950', icon: AlertCircle }
    }
    if (isAfter(now, closeDate)) {
      return { label: 'Closed', color: 'text-red-600 bg-red-50 dark:bg-red-950', icon: XCircle }
    }
    if (isAfter(openDate, now)) {
      return { label: 'Scheduled', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950', icon: Clock }
    }
    return { label: 'Active', color: 'text-green-600 bg-green-50 dark:bg-green-950', icon: CheckCircle }
  }

  const getDaysRemaining = (closeDate: string) => {
    const days = differenceInDays(new Date(closeDate), new Date())
    if (days < 0) return 'Closed'
    if (days === 0) return 'Closes today'
    if (days === 1) return '1 day left'
    return `${days} days left`
  }

  // Sort forms: active first, then by created date
  const sortedForms = [...forms].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Application Forms</h2>
        <Link
          href="/admin/applications/form-builder"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Form
        </Link>
      </div>

      {/* Forms List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <AnimatePresence>
          {sortedForms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No forms yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first application form to start accepting applications
              </p>
              <Link
                href="/admin/applications/form-builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                <Plus className="h-5 w-5" />
                Create Your First Form
              </Link>
            </motion.div>
          ) : (
            <div className="divide-y divide-border">
              {sortedForms.map((form, index) => {
                const status = getFormStatus(form)
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={form.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-6 hover:bg-muted/50 transition-all",
                      form.isActive && "bg-primary/5"
                    )}
                    onMouseEnter={() => setSelectedForm(form.id)}
                    onMouseLeave={() => setSelectedForm(null)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Form Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-foreground">
                                {form.title}
                              </h3>
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
                                status.color
                              )}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </span>
                              {form.isActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                                  Active
                                </span>
                              )}
                            </div>
                            {form.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {form.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {format(new Date(form.openDate), 'MMM d')} - {format(new Date(form.closeDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className={cn(
                              "font-medium",
                              getDaysRemaining(form.closeDate) === 'Closed' ? 'text-red-600' : 'text-foreground'
                            )}>
                              {getDaysRemaining(form.closeDate)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {form.applicationCount || 0}
                            </span>
                            <span className="text-muted-foreground">responses</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {selectedForm === form.id && (
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-1"
                            >
                              <Link
                                href={`/admin/applications/${form.id}`}
                                className="p-2 hover:bg-muted rounded-lg transition-all"
                                title="View responses"
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Link>
                              
                              <Link
                                href={`/admin/applications/form-builder?id=${form.id}`}
                                className="p-2 hover:bg-muted rounded-lg transition-all"
                                title="Edit form"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                              </Link>

                              <button
                                onClick={() => handleToggleActive(form)}
                                className="p-2 hover:bg-muted rounded-lg transition-all"
                                title={form.isActive ? "Deactivate form" : "Activate form"}
                              >
                                {form.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="relative">
                          <button
                            onClick={() => setShowMenu(showMenu === form.id ? null : form.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-all"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>

                          <AnimatePresence>
                            {showMenu === form.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10 py-1"
                              >
                                <button
                                  onClick={() => {
                                    handleDuplicate(form)
                                    setShowMenu(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-all flex items-center gap-2"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // Archive logic
                                    setShowMenu(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-all flex items-center gap-2"
                                >
                                  <Archive className="h-4 w-4" />
                                  Archive
                                </button>
                                
                                {(!form.applicationCount || form.applicationCount === 0) && (
                                  <button
                                    onClick={() => {
                                      handleDelete(form.id)
                                      setShowMenu(null)
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 transition-all flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}