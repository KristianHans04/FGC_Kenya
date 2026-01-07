'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  Copy,
  ChevronUp,
  ChevronDown,
  Settings,
  FileText,
  Calendar,
  X,
  GripVertical,
  Eye,
  AlertCircle,
  Menu,
  RefreshCw,
  Layout,
  Type,
  EyeOff,
  Palette,
  Image as ImageIcon,
  Check,
  Upload
} from 'lucide-react'

// Theme colors available for forms (inspired by Google Forms)
const THEME_COLORS = [
  { name: 'Kenya Green', value: '#006600', accent: '#008800' },
  { name: 'Kenya Red', value: '#CE1126', accent: '#FF1744' },
  { name: 'Kenya Black', value: '#000000', accent: '#333333' },
  { name: 'Ocean Blue', value: '#1976D2', accent: '#42A5F5' },
  { name: 'Royal Purple', value: '#6A1B9A', accent: '#9C27B0' },
  { name: 'Sunset Orange', value: '#E65100', accent: '#FF9800' },
  { name: 'Forest Green', value: '#1B5E20', accent: '#4CAF50' },
  { name: 'Berry Red', value: '#C62828', accent: '#EF5350' }
]

// Predefined cover image suggestions (can still use custom URL)
const COVER_IMAGE_SUGGESTIONS = [
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600', // Team working
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600', // Technology
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1600', // Robotics
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600', // Collaboration
]

// Field types available in the form builder
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'email', label: 'Email', icon: Type },
  { value: 'tel', label: 'Phone Number', icon: Type },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: ChevronDown },
  { value: 'textarea', label: 'Text Area', icon: Type },
  { value: 'radio', label: 'Radio Buttons', icon: Type },
  { value: 'checkbox', label: 'Checkbox', icon: Check },
  { value: 'url', label: 'URL/Link', icon: Type },
  { value: 'multiselect', label: 'Multiple Select', icon: ChevronDown }
]

// Auto-fill field mappings
const AUTO_FILL_FIELDS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'dateOfBirth', label: 'Date of Birth' },
  { value: 'school', label: 'School' },
  { value: 'grade', label: 'Grade' },
  { value: 'county', label: 'County' }
]

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: string
    max?: string
  }
  autoFillFrom?: string
  helpText?: string
  rows?: number
}

interface FormTab {
  id: string
  title: string
  description?: string
  fields: FormField[]
  order: number
}

interface ApplicationFormData {
  id?: string
  season: string
  title: string
  description: string
  tabs: FormTab[]
  allowSaveDraft: boolean
  requireDocumentLinks: boolean
  enableAutoFill: boolean
  openDate: string
  closeDate: string
  isActive: boolean
  themeColor?: string
  accentColor?: string
  coverImage?: string
}

interface ApplicationFormBuilderProps {
  initialData?: ApplicationFormData
  onSave: (data: ApplicationFormData) => Promise<void>
  onCancel: () => void
}

type ViewMode = 'settings' | 'builder' | 'properties'

// Flash message component
const FlashMessage = ({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'warning'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
  const icon = type === 'error' ? <AlertCircle /> : type === 'warning' ? <AlertCircle /> : <Check />

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}
    >
      <span className="h-5 w-5">{icon}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// Field error animation
const fieldErrorAnimation = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
}

export default function ApplicationFormBuilder({
  initialData,
  onSave,
  onCancel
}: ApplicationFormBuilderProps) {
  const [formData, setFormData] = useState<ApplicationFormData>(
    initialData || {
      season: `FGC${new Date().getFullYear() + 1}`,
      title: '',
      description: '',
      tabs: [],
      allowSaveDraft: true,
      requireDocumentLinks: true,
      enableAutoFill: true,
      openDate: '',
      closeDate: '',
      isActive: false,
      themeColor: THEME_COLORS[0].value,
      accentColor: THEME_COLORS[0].accent,
      coverImage: ''
    }
  )

  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [flashMessage, setFlashMessage] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [customCoverUrl, setCustomCoverUrl] = useState('')
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Mobile view state
  const [activeView, setActiveView] = useState<ViewMode>('builder')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Autosave functionality
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Don't autosave if no changes or if form is invalid
    if (!formData.title || !formData.season) {
      return
    }

    // Set new timer for autosave (5 seconds after last change)
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 5000)

    setAutoSaveTimer(timer)

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [formData])

  // Autosave function
  const handleAutoSave = async () => {
    if (isSaving || saving) return
    
    setIsSaving(true)
    try {
      const autoSaveData = {
        ...formData,
        isDraft: true,
        isAutoSave: true
      }
      
      if (initialData?.id) {
        // Update existing form
        const response = await fetch(`/api/applications/forms/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(autoSaveData)
        })
        
        if (response.ok) {
          setLastSaved(new Date())
        } else if (response.status === 401) {
          // Session expired - don't show error, just skip autosave
          console.debug('Session expired, skipping autosave')
        }
      } else if (formData.season && formData.title && !initialData?.id) {
        // Only create if we don't have an ID yet
        // This prevents duplicate creation attempts
        const response = await fetch('/api/applications/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(autoSaveData)
        })
        
        if (response.ok) {
          const data = await response.json()
          // Store the ID to prevent duplicate creation
          setFormData(prev => ({ ...prev, id: data.data.form.id }))
          setLastSaved(new Date())
        } else if (response.status === 400) {
          // Form already exists, likely from a previous autosave
          // Try to fetch existing form
          const errorData = await response.json()
          if (errorData.error?.message?.includes('season already exists')) {
            // Don't show error for duplicate season during autosave
            console.debug('Form for season already exists')
          }
        } else if (response.status === 401) {
          // Session expired - don't show error, just skip autosave
          console.debug('Session expired, skipping autosave')
        }
      }
    } catch (error) {
      // Silent fail for autosave - don't disturb user
      console.debug('Autosave failed silently:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-switch views on selection
  useEffect(() => {
    if (isMobile) {
      if (selectedField) setActiveView('properties')
      else if (selectedTab) setActiveView('builder')
    }
  }, [selectedField, selectedTab, isMobile])

  // Add a new tab
  const addTab = () => {
    const newTab: FormTab = {
      id: `tab-${Date.now()}`,
      title: `Section ${formData.tabs.length + 1}`,
      description: '',
      fields: [],
      order: formData.tabs.length
    }
    setFormData(prev => ({
      ...prev,
      tabs: [...prev.tabs, newTab]
    }))
    setSelectedTab(newTab.id)
    if (isMobile) setActiveView('builder')
  }

  // Update tab
  const updateTab = (tabId: string, updates: Partial<FormTab>) => {
    setFormData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    }))
  }

  // Delete tab
  const deleteTab = (tabId: string) => {
    setFormData(prev => ({
      ...prev,
      tabs: prev.tabs.filter(tab => tab.id !== tabId)
    }))
    if (selectedTab === tabId) {
      setSelectedTab(null)
    }
  }

  // Move tab up/down
  const moveTab = (tabId: string, direction: 'up' | 'down') => {
    const tabs = [...formData.tabs]
    const index = tabs.findIndex(t => t.id === tabId)
    
    if (direction === 'up' && index > 0) {
      [tabs[index], tabs[index - 1]] = [tabs[index - 1], tabs[index]]
    } else if (direction === 'down' && index < tabs.length - 1) {
      [tabs[index], tabs[index + 1]] = [tabs[index + 1], tabs[index]]
    }
    
    tabs.forEach((tab, i) => {
      tab.order = i
    })
    
    setFormData(prev => ({ ...prev, tabs }))
  }

  // Add field to tab
  const addField = (tabId: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false
    }
    
    setFormData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, fields: [...tab.fields, newField] }
          : tab
      )
    }))
    setSelectedField(newField.id)
    if (isMobile) setActiveView('properties')
  }

  // Update field
  const updateField = (tabId: string, fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId
          ? {
              ...tab,
              fields: tab.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : tab
      )
    }))
  }

  // Delete field
  const deleteField = (tabId: string, fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, fields: tab.fields.filter(f => f.id !== fieldId) }
          : tab
      )
    }))
    if (selectedField === fieldId) {
      setSelectedField(null)
    }
  }

  // Add option to select/radio field
  const addOption = (tabId: string, fieldId: string) => {
    const tab = formData.tabs.find(t => t.id === tabId)
    const field = tab?.fields.find(f => f.id === fieldId)
    
    if (field) {
      const newOption = {
        value: `option-${Date.now()}`,
        label: `Option ${(field.options?.length || 0) + 1}`
      }
      
      updateField(tabId, fieldId, {
        options: [...(field.options || []), newOption]
      })
    }
  }

  // Update option
  const updateOption = (
    tabId: string,
    fieldId: string,
    optionIndex: number,
    updates: { value?: string; label?: string }
  ) => {
    const tab = formData.tabs.find(t => t.id === tabId)
    const field = tab?.fields.find(f => f.id === fieldId)
    
    if (field?.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates }
      updateField(tabId, fieldId, { options: newOptions })
    }
  }

  // Delete option
  const deleteOption = (tabId: string, fieldId: string, optionIndex: number) => {
    const tab = formData.tabs.find(t => t.id === tabId)
    const field = tab?.fields.find(f => f.id === fieldId)
    
    if (field?.options) {
      const newOptions = field.options.filter((_, i) => i !== optionIndex)
      updateField(tabId, fieldId, { options: newOptions })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.season) {
      newErrors.season = 'Season is required'
    }
    
    if (!formData.openDate) {
      newErrors.openDate = 'Open date is required'
    }
    
    if (!formData.closeDate) {
      newErrors.closeDate = 'Close date is required'
    }
    
    if (formData.openDate && formData.closeDate && new Date(formData.openDate) >= new Date(formData.closeDate)) {
      newErrors.closeDate = 'Close date must be after open date'
    }
    
    if (formData.tabs.length === 0) {
      newErrors.tabs = 'At least one section is required'
    }
    
    formData.tabs.forEach(tab => {
      if (!tab.title) {
        newErrors[`tab-${tab.id}`] = 'Section title is required'
      }
      if (tab.fields.length === 0) {
        newErrors[`tab-${tab.id}-fields`] = 'Section must have at least one field'
      }
      
      tab.fields.forEach(field => {
        if (!field.label) {
          newErrors[`field-${field.id}`] = 'Field label is required'
        }
        if ((field.type === 'select' || field.type === 'radio' || field.type === 'multiselect') && 
            (!field.options || field.options.length === 0)) {
          newErrors[`field-${field.id}-options`] = 'Options are required for this field type'
        }
      })
    })
    
    setErrors(newErrors)
    
    // Show flash message for errors
    if (Object.keys(newErrors).length > 0) {
      const errorCount = Object.keys(newErrors).length
      setFlashMessage({
        message: `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before saving`,
        type: 'error'
      })
    }
    
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    try {
      await onSave(formData)
      setFlashMessage({ message: 'Form saved successfully!', type: 'success' })
    } catch (error: any) {
      // Extract error message properly
      let errorMessage = 'Failed to save form. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      setFlashMessage({ message: errorMessage, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleThemeSelect = (color: typeof THEME_COLORS[0]) => {
    setFormData(prev => ({
      ...prev,
      themeColor: color.value,
      accentColor: color.accent
    }))
    setShowThemeSelector(false)
  }

  const handleCoverImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, coverImage: url }))
    setCustomCoverUrl(url)
  }

  const currentTab = formData.tabs.find(t => t.id === selectedTab)
  const currentField = currentTab?.fields.find(f => f.id === selectedField)

  // Preview Component
  const FormPreview = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="min-h-screen p-4">
        <div className="max-w-3xl mx-auto">
          {/* Preview Header with Cover Image */}
          <div 
            className="relative h-48 rounded-t-xl overflow-hidden"
            style={{ 
              background: formData.coverImage 
                ? `url(${formData.coverImage}) center/cover` 
                : `linear-gradient(135deg, ${formData.themeColor} 0%, ${formData.accentColor} 100%)`
            }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-3xl font-bold">{formData.title || 'Untitled Form'}</h1>
              <p className="mt-1">{formData.description}</p>
            </div>
          </div>

          {/* Preview Form Content */}
          <div className="bg-card rounded-b-xl shadow-xl p-6 space-y-6">
            {formData.tabs.map((tab, tabIndex) => (
              <div key={tab.id} className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h2 className="text-xl font-semibold" style={{ color: formData.themeColor }}>
                    {tab.title}
                  </h2>
                  {tab.description && <p className="text-sm text-muted-foreground mt-1">{tab.description}</p>}
                </div>
                
                {tab.fields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {/* Render field based on type */}
                    {field.type === 'textarea' ? (
                      <textarea 
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                      />
                    ) : field.type === 'select' ? (
                      <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                        <option value="">Select an option</option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2">
                            <input type="radio" name={field.id} value={opt.value} />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span>Check to confirm</span>
                      </label>
                    ) : (
                      <input 
                        type={field.type}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                        placeholder={field.placeholder}
                      />
                    )}
                    
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Close Preview Button - More Visible */}
          <button
            onClick={() => setShowPreview(false)}
            className="fixed top-4 right-4 z-50 bg-red-600 text-white shadow-lg rounded-full p-3 hover:bg-red-700 transition-all hover:scale-110"
            title="Close Preview"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Alternative close button at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-center z-50">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Exit Preview
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="h-full bg-muted/20 text-foreground flex flex-col overflow-hidden">
      {/* Flash Messages */}
      <AnimatePresence>
        {flashMessage && (
          <FlashMessage
            message={flashMessage.message}
            type={flashMessage.type}
            onClose={() => setFlashMessage(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-card border-b border-border p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${formData.themeColor}20` }}>
              <FileText className="h-6 w-6" style={{ color: formData.themeColor }} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Form Builder</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {initialData ? 'Edit' : 'Create'} application form for {formData.season}
                </p>
                {/* Autosave indicator */}
                {isSaving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                )}
                {!isSaving && lastSaved && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Theme Color"
              >
                <Palette className="h-5 w-5" style={{ color: formData.themeColor }} />
              </button>
              {showThemeSelector && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowThemeSelector(false)}
                  />
                  <div className="absolute top-12 right-0 bg-card border border-border rounded-lg shadow-xl p-4 z-50 min-w-[280px]">
                    <p className="text-sm font-medium mb-3">Choose Theme Color</p>
                    <div className="grid grid-cols-4 gap-3">
                      {THEME_COLORS.map(color => (
                        <button
                          key={color.value}
                          onClick={() => {
                            handleThemeSelect(color)
                            setShowThemeSelector(false)
                          }}
                          className="group relative"
                          title={color.name}
                        >
                          <div 
                            className="w-12 h-12 rounded-lg border-2 hover:scale-110 transition-all"
                            style={{ 
                              backgroundColor: color.value, 
                              borderColor: formData.themeColor === color.value ? color.accent : 'transparent' 
                            }}
                          />
                          {formData.themeColor === color.value && (
                            <Check className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-md" />
                          )}
                          <p className="text-[10px] mt-1 text-center text-muted-foreground group-hover:text-foreground">
                            {color.name.split(' ')[0]}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                showPreview 
                  ? 'bg-primary/10 text-primary border-primary' 
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
              }`}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">Preview</span>
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ backgroundColor: formData.themeColor }}
            >
              {saving ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Save Form</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Show Preview Modal */}
      <AnimatePresence>
        {showPreview && <FormPreview />}
      </AnimatePresence>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="flex-none bg-card border-b border-border px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shadow-sm">
          <button
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === 'settings' 
                ? 'text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            style={activeView === 'settings' ? { backgroundColor: formData.themeColor } : {}}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveView('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === 'builder' 
                ? 'text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            style={activeView === 'builder' ? { backgroundColor: formData.themeColor } : {}}
          >
            <Layout className="h-4 w-4" />
            Builder
          </button>
          <button
            onClick={() => setActiveView('properties')}
            disabled={!selectedField}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === 'properties' 
                ? 'text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted disabled:opacity-50'
            }`}
            style={activeView === 'properties' ? { backgroundColor: formData.themeColor } : {}}
          >
            <Type className="h-4 w-4" />
            Properties
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Panel - Form Settings & Tabs */}
        <div className={`
          ${isMobile ? (activeView === 'settings' ? 'w-full' : 'hidden') : 'w-64 lg:w-80 shrink-0 border-r border-border'} 
          bg-card overflow-y-auto flex flex-col h-full
        `}>
          {/* Form Settings Section */}
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Settings className="h-4 w-4" style={{ color: formData.themeColor }} />
              Form Settings
            </h3>
            
            <div className="space-y-4">
              {/* Cover Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage || ''}
                  onChange={(e) => handleCoverImageChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.coverImage && (
                  <div className="mt-2 relative h-24 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={formData.coverImage} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                      Failed to load image
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Enter a URL to an image for the form header
                </p>
                
                {/* Suggestions */}
                <div className="mt-2">
                  <p className="text-[10px] text-muted-foreground mb-1">Quick suggestions:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {COVER_IMAGE_SUGGESTIONS.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => handleCoverImageChange(url)}
                        className="h-12 bg-muted rounded overflow-hidden hover:ring-1 hover:ring-primary transition-all"
                      >
                        <img src={url} alt={`Suggestion ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div 
                className="space-y-1.5"
                animate={errors.season ? fieldErrorAnimation.animate : {}}
              >
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Season <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    errors.season ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="e.g., FGC2026"
                />
                {errors.season && (
                  <p className="text-xs text-red-500">{errors.season}</p>
                )}
              </motion.div>
              
              <motion.div 
                className="space-y-1.5"
                animate={errors.title ? fieldErrorAnimation.animate : {}}
              >
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                    errors.title ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="Application form title"
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </motion.div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <motion.div 
                  className="space-y-1.5"
                  animate={errors.openDate ? fieldErrorAnimation.animate : {}}
                >
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Open <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.openDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, openDate: e.target.value }))}
                    className={`w-full px-2 py-2 text-xs bg-background border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.openDate ? 'border-red-500' : 'border-input'
                    }`}
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-1.5"
                  animate={errors.closeDate ? fieldErrorAnimation.animate : {}}
                >
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Close <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.closeDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, closeDate: e.target.value }))}
                    className={`w-full px-2 py-2 text-xs bg-background border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.closeDate ? 'border-red-500' : 'border-input'
                    }`}
                  />
                </motion.div>
              </div>
              {errors.closeDate && (
                <p className="text-xs text-red-500">{errors.closeDate}</p>
              )}
              
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.allowSaveDraft}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowSaveDraft: e.target.checked }))}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Allow saving drafts</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.requireDocumentLinks}
                    onChange={(e) => setFormData(prev => ({ ...prev, requireDocumentLinks: e.target.checked }))}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Require document links</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.enableAutoFill}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableAutoFill: e.target.checked }))}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Enable auto-fill</span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Active immediately</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Tabs List Section */}
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
                <FileText className="h-4 w-4" style={{ color: formData.themeColor }} />
                Form Sections
              </h3>
              
              <button
                onClick={addTab}
                className="p-1.5 text-white rounded-md transition-all hover:opacity-90"
                style={{ backgroundColor: formData.themeColor }}
                title="Add Section"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {errors.tabs && (
              <motion.div 
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                animate={fieldErrorAnimation.animate}
              >
                <p className="text-xs text-red-500 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  {errors.tabs}
                </p>
              </motion.div>
            )}
            
            <div className="space-y-2">
              <AnimatePresence>
                {formData.tabs.sort((a, b) => a.order - b.order).map((tab) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`group relative p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTab === tab.id
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-sm'
                    }`}
                    onClick={() => {
                      setSelectedTab(tab.id)
                      if (isMobile) setActiveView('builder')
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`p-1.5 rounded-md text-white`}
                          style={{ backgroundColor: selectedTab === tab.id ? formData.themeColor : '#9CA3AF' }}
                        >
                          <span className="text-xs font-bold">{tab.order + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[120px]">{tab.title || 'Untitled Section'}</p>
                          <p className="text-xs text-muted-foreground">
                            {tab.fields.length} fields
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTab(tab.id, 'up')
                            }}
                            disabled={tab.order === 0}
                            className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTab(tab.id, 'down')
                            }}
                            disabled={tab.order === formData.tabs.length - 1}
                            className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTab(tab.id)
                          }}
                          className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    {(errors[`tab-${tab.id}`] || errors[`tab-${tab.id}-fields`]) && (
                      <motion.div 
                        className="absolute -right-1 -top-1"
                        animate={fieldErrorAnimation.animate}
                      >
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {formData.tabs.length === 0 && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">No sections yet</p>
                  <button
                    onClick={addTab}
                    className="text-sm font-medium"
                    style={{ color: formData.themeColor }}
                  >
                    Add your first section
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Panel - Tab Content & Fields */}
        <div className={`
          ${isMobile ? (activeView === 'builder' ? 'w-full' : 'hidden') : 'flex-1'} 
          bg-muted/20 overflow-y-auto p-4 sm:p-8
        `}>
          {currentTab ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <input
                  type="text"
                  value={currentTab.title}
                  onChange={(e) => updateTab(currentTab.id, { title: e.target.value })}
                  className="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted-foreground/50"
                  placeholder="Section Title"
                />
                
                <textarea
                  value={currentTab.description || ''}
                  onChange={(e) => updateTab(currentTab.id, { description: e.target.value })}
                  className="mt-2 w-full text-muted-foreground bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-muted-foreground/50"
                  placeholder="Add a description for this section (optional)"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-sm">Fields</h4>
                
                <button
                  onClick={() => addField(currentTab.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-white rounded-md text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
                  style={{ backgroundColor: formData.themeColor }}
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </button>
              </div>
              
              <div className="space-y-3 pb-20">
                <AnimatePresence>
                  {currentTab.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group relative bg-card border rounded-xl p-4 transition-all duration-200 ${
                        selectedField === field.id
                          ? 'ring-1 shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                      }`}
                      style={selectedField === field.id ? { borderColor: formData.themeColor } : {}}
                      onClick={() => {
                        setSelectedField(field.id)
                        if (isMobile) setActiveView('properties')
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="mt-1 text-xs font-mono text-white px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: formData.accentColor }}
                        >
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-foreground">
                              {field.label || <span className="text-muted-foreground italic">Untitled Field</span>}
                            </h5>
                            {field.required && (
                              <span className="text-red-500 text-xs font-bold" title="Required">*</span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                          </p>
                          
                          {field.helpText && (
                            <p className="text-xs text-muted-foreground italic">{field.helpText}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(currentTab.id, field.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-md transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {errors[`field-${field.id}`] && (
                        <motion.div 
                          className="mt-2 text-xs text-red-500"
                          animate={fieldErrorAnimation.animate}
                        >
                          {errors[`field-${field.id}`]}
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {currentTab.fields.length === 0 && (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-lg">
                    <Type className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">No fields in this section</p>
                    <button
                      onClick={() => addField(currentTab.id)}
                      className="text-sm font-medium"
                      style={{ color: formData.themeColor }}
                    >
                      Add your first field
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <Layout className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm mb-1">No section selected</p>
              <p className="text-xs">Select a section from the left or create a new one</p>
            </div>
          )}
        </div>

        {/* Right Panel - Field Properties */}
        <div className={`
          ${isMobile ? (activeView === 'properties' ? 'w-full' : 'hidden') : 'w-64 lg:w-80 shrink-0 border-l border-border'} 
          bg-card overflow-y-auto
        `}>
          {currentField && currentTab ? (
            <div className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Edit2 className="h-4 w-4" style={{ color: formData.themeColor }} />
                Field Properties
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Field Type</label>
                  <select
                    value={currentField.type}
                    onChange={(e) => updateField(currentTab.id, currentField.id, { type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</label>
                  <input
                    type="text"
                    value={currentField.label}
                    onChange={(e) => updateField(currentTab.id, currentField.id, { label: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Full Name"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Placeholder</label>
                  <input
                    type="text"
                    value={currentField.placeholder || ''}
                    onChange={(e) => updateField(currentTab.id, currentField.id, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Enter your full name"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Help Text</label>
                  <textarea
                    value={currentField.helpText || ''}
                    onChange={(e) => updateField(currentTab.id, currentField.id, { helpText: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    rows={2}
                    placeholder="Helper text displayed below the input"
                  />
                </div>

                {formData.enableAutoFill && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Auto-fill Source</label>
                    <select
                      value={currentField.autoFillFrom || ''}
                      onChange={(e) => updateField(currentTab.id, currentField.id, { autoFillFrom: e.target.value || undefined })}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="">None</option>
                      {AUTO_FILL_FIELDS.map(field => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground">
                      Auto-fill from user profile
                    </p>
                  </div>
                )}
                
                <div className="pt-2 border-t border-border">
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={currentField.required}
                      onChange={(e) => updateField(currentTab.id, currentField.id, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Required Field</span>
                  </label>
                </div>

                {/* Options for Select/Radio/Multiselect */}
                {['select', 'radio', 'multiselect'].includes(currentField.type) && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Options</label>
                      <button
                        onClick={() => addOption(currentTab.id, currentField.id)}
                        className="text-xs font-medium"
                        style={{ color: formData.themeColor }}
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {currentField.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updateOption(currentTab.id, currentField.id, index, { label: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm bg-background border border-input rounded focus:border-primary outline-none"
                            placeholder="Option Label"
                          />
                          <button
                            onClick={() => deleteOption(currentTab.id, currentField.id, index)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      {(!currentField.options || currentField.options.length === 0) && (
                        <p className="text-xs text-red-500 italic">At least one option is required</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Simple Validation Settings (removed regex) */}
                {['text', 'email', 'tel', 'url', 'textarea'].includes(currentField.type) && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Validation</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Min Length</label>
                        <input
                          type="number"
                          value={currentField.validation?.minLength || ''}
                          onChange={(e) => updateField(currentTab.id, currentField.id, {
                            validation: { ...currentField.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          className="w-full px-2 py-1.5 text-sm bg-background border border-input rounded focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Max Length</label>
                        <input
                          type="number"
                          value={currentField.validation?.maxLength || ''}
                          onChange={(e) => updateField(currentTab.id, currentField.id, {
                            validation: { ...currentField.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          className="w-full px-2 py-1.5 text-sm bg-background border border-input rounded focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
              <Type className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Select a field to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}