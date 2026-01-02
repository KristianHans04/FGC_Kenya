'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link as LinkIcon,
  Eye,
  X,
  Check,
  FileText,
  User,
  GraduationCap,
  Target,
  Globe
} from 'lucide-react'

// Types
interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'radio' | 'checkbox' | 'url' | 'multiselect'
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: string
    max?: string
  }
  autoFillFrom?: string // Field name from user profile
  helpText?: string
  rows?: number // for textarea
}

interface FormTab {
  id: string
  title: string
  description?: string
  icon?: any
  fields: FormField[]
  order: number
}

interface ApplicationForm {
  id: string
  season: string
  title: string
  description: string
  tabs: FormTab[]
  allowSaveDraft: boolean
  requireDocumentLinks: boolean
  enableAutoFill: boolean
}

interface ApplicationFormProps {
  form: ApplicationForm
  applicationId?: string // For editing existing application
  onClose?: () => void
}

// Tab icons mapping
const tabIcons: Record<string, any> = {
  personal: User,
  education: GraduationCap,
  experience: Target,
  documents: FileText,
  additional: Globe
}

export default function MultiTabApplicationForm({
  form,
  applicationId,
  onClose
}: ApplicationFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  // State
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [completedTabs, setCompletedTabs] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [linkPreviews, setLinkPreviews] = useState<Record<string, any>>({})
  const [autoFillApplied, setAutoFillApplied] = useState(false)

  // Sort tabs by order
  const sortedTabs = [...form.tabs].sort((a, b) => a.order - b.order)
  const currentTab = sortedTabs[currentTabIndex]
  
  // Calculate progress
  const totalFields = sortedTabs.reduce((sum, tab) => 
    sum + tab.fields.filter(f => f.required).length, 0
  )
  const completedFields = sortedTabs.reduce((sum, tab) => {
    const requiredFields = tab.fields.filter(f => f.required)
    const completed = requiredFields.filter(f => {
      const value = formData[`${tab.id}.${f.id}`]
      return value && value !== ''
    }).length
    return sum + completed
  }, 0)
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0

  // Load existing application or user profile data
  useEffect(() => {
    if (applicationId) {
      loadApplication()
    } else if (form.enableAutoFill && !autoFillApplied) {
      autoFillFromProfile()
    }
  }, [applicationId, form.enableAutoFill])

  // Load existing application
  const loadApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(data.responses || {})
        setCompletedTabs(data.completedTabs || [])
      }
    } catch (error) {
      console.error('Failed to load application:', error)
    }
  }

  // Auto-fill from user profile
  const autoFillFromProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const { data: profile } = await response.json()
        const autoFilledData: Record<string, any> = {}
        
        sortedTabs.forEach(tab => {
          tab.fields.forEach(field => {
            if (field.autoFillFrom && profile[field.autoFillFrom]) {
              autoFilledData[`${tab.id}.${field.id}`] = profile[field.autoFillFrom]
            }
          })
        })
        
        setFormData(prev => ({ ...autoFilledData, ...prev }))
        setAutoFillApplied(true)
        
        if (Object.keys(autoFilledData).length > 0) {
          setMessage('Some fields have been auto-filled from your profile')
          setTimeout(() => setMessage(''), 3000)
        }
      }
    } catch (error) {
      console.error('Failed to auto-fill from profile:', error)
    }
  }

  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    const fullFieldId = `${currentTab.id}.${fieldId}`
    setFormData(prev => ({ ...prev, [fullFieldId]: value }))
    
    // Clear error for this field
    if (errors[fullFieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fullFieldId]
        return newErrors
      })
    }
  }

  // Validate current tab
  const validateTab = (): boolean => {
    const tabErrors: Record<string, string> = {}
    
    currentTab.fields.forEach(field => {
      const fullFieldId = `${currentTab.id}.${field.id}`
      const value = formData[fullFieldId]
      
      // Required validation
      if (field.required && (!value || value === '')) {
        tabErrors[fullFieldId] = `${field.label} is required`
      }
      
      // Pattern validation
      if (value && field.validation?.pattern) {
        const pattern = new RegExp(field.validation.pattern)
        if (!pattern.test(value)) {
          tabErrors[fullFieldId] = `Invalid ${field.label.toLowerCase()} format`
        }
      }
      
      // Length validation
      if (value && typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          tabErrors[fullFieldId] = `${field.label} must be at least ${field.validation.minLength} characters`
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          tabErrors[fullFieldId] = `${field.label} must not exceed ${field.validation.maxLength} characters`
        }
      }
    })
    
    setErrors(tabErrors)
    return Object.keys(tabErrors).length === 0
  }

  // Navigate between tabs
  const goToTab = (index: number) => {
    if (index < 0 || index >= sortedTabs.length) return
    
    // Validate current tab before moving if going forward
    if (index > currentTabIndex && !validateTab()) {
      return
    }
    
    // Mark current tab as completed if valid
    if (validateTab() && !completedTabs.includes(currentTab.id)) {
      setCompletedTabs(prev => [...prev, currentTab.id])
    }
    
    setCurrentTabIndex(index)
  }

  // Save draft
  const saveDraft = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const payload = {
        formId: form.id,
        season: form.season,
        responses: formData,
        completedTabs,
        currentTab: currentTab.id,
        progress
      }
      
      const url = applicationId 
        ? `/api/applications/${applicationId}`
        : '/api/applications'
      
      const response = await fetch(url, {
        method: applicationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessage('Application saved successfully')
        
        // Update any new profile fields back to settings
        await syncToProfile()
        
        if (!applicationId && data.id) {
          router.push(`/dashboard/applications/${data.id}/edit`)
        }
      } else {
        throw new Error('Failed to save application')
      }
    } catch (error) {
      setMessage('Failed to save application')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Submit application
  const submitApplication = async () => {
    // Validate all tabs
    let hasErrors = false
    sortedTabs.forEach((tab, index) => {
      setCurrentTabIndex(index)
      if (!validateTab()) {
        hasErrors = true
      }
    })
    
    if (hasErrors) {
      setMessage('Please complete all required fields')
      return
    }
    
    setSubmitting(true)
    setMessage('')
    
    try {
      const payload = {
        formId: form.id,
        season: form.season,
        responses: formData,
        completedTabs: sortedTabs.map(t => t.id),
        progress: 100,
        status: 'SUBMITTED'
      }
      
      const url = applicationId 
        ? `/api/applications/${applicationId}/submit`
        : '/api/applications/submit'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        await syncToProfile()
        router.push('/dashboard/applications?success=submitted')
      } else {
        throw new Error('Failed to submit application')
      }
    } catch (error) {
      setMessage('Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  // Sync data back to profile
  const syncToProfile = async () => {
    const profileUpdates: Record<string, any> = {}
    
    sortedTabs.forEach(tab => {
      tab.fields.forEach(field => {
        if (field.autoFillFrom) {
          const value = formData[`${tab.id}.${field.id}`]
          if (value) {
            profileUpdates[field.autoFillFrom] = value
          }
        }
      })
    })
    
    if (Object.keys(profileUpdates).length > 0) {
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileUpdates)
        })
      } catch (error) {
        console.error('Failed to sync to profile:', error)
      }
    }
  }

  // Fetch link preview
  const fetchLinkPreview = async (url: string, fieldId: string) => {
    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (response.ok) {
        const preview = await response.json()
        setLinkPreviews(prev => ({ ...prev, [fieldId]: preview }))
      }
    } catch (error) {
      console.error('Failed to fetch link preview:', error)
    }
  }

  // Render field
  const renderField = (field: FormField) => {
    const fullFieldId = `${currentTab.id}.${field.id}`
    const value = formData[fullFieldId] || ''
    const error = errors[fullFieldId]
    const TabIcon = tabIcons[currentTab.id] || FileText

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary ${
              error ? 'border-red-500' : 'border-border'
            }`}
            required={field.required}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary resize-none ${
              error ? 'border-red-500' : 'border-border'
            }`}
            required={field.required}
          />
        )
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={fullFieldId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="text-primary focus:ring-primary"
                  required={field.required}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="text-primary focus:ring-primary rounded"
              required={field.required}
            />
            <span className="text-sm">{field.placeholder || field.label}</span>
          </label>
        )
      
      case 'url':
        return (
          <div className="space-y-2">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                onBlur={() => value && fetchLinkPreview(value, fullFieldId)}
                placeholder={field.placeholder || 'https://...'}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary ${
                  error ? 'border-red-500' : 'border-border'
                }`}
                required={field.required}
              />
            </div>
            {linkPreviews[fullFieldId] && (
              <div className="p-3 border border-border rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  {linkPreviews[fullFieldId].image && (
                    <img 
                      src={linkPreviews[fullFieldId].image} 
                      alt="" 
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {linkPreviews[fullFieldId].title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {linkPreviews[fullFieldId].description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary ${
              error ? 'border-red-500' : 'border-border'
            }`}
            required={field.required}
            {...(field.validation && {
              pattern: field.validation.pattern,
              minLength: field.validation.minLength,
              maxLength: field.validation.maxLength,
              min: field.validation.min,
              max: field.validation.max
            })}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{form.title}</h1>
              <p className="text-muted-foreground">{form.description}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* Tab navigation - Mobile horizontal scroll */}
          <div className="mt-4 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max md:min-w-0 md:grid md:grid-cols-5">
              {sortedTabs.map((tab, index) => {
                const TabIcon = tabIcons[tab.id] || FileText
                const isActive = index === currentTabIndex
                const isCompleted = completedTabs.includes(tab.id)
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => goToTab(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <TabIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{tab.title}</span>
                    {isCompleted && <Check className="h-3 w-3 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Form content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-2">{currentTab.title}</h2>
              {currentTab.description && (
                <p className="text-muted-foreground mb-6">{currentTab.description}</p>
              )}
              
              <div className="space-y-6">
                {currentTab.fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {field.helpText && (
                      <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                    {errors[`${currentTab.id}.${field.id}`] && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[`${currentTab.id}.${field.id}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              message.includes('success') || message.includes('saved')
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : message.includes('fail') || message.includes('error')
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            }`}
          >
            {message.includes('success') || message.includes('saved') ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message}</span>
          </motion.div>
        )}
        
        {/* Navigation buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
          <button
            onClick={() => goToTab(currentTabIndex - 1)}
            disabled={currentTabIndex === 0}
            className="btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          <div className="flex gap-2">
            {form.allowSaveDraft && (
              <button
                onClick={saveDraft}
                disabled={saving || submitting}
                className="btn-secondary flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Draft
              </button>
            )}
            
            {currentTabIndex === sortedTabs.length - 1 ? (
              <button
                onClick={submitApplication}
                disabled={submitting || saving}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Application
              </button>
            ) : (
              <button
                onClick={() => goToTab(currentTabIndex + 1)}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}