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
  Layout,
  Type,
  EyeOff
} from 'lucide-react'

// Field types available in the form builder
const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'url', label: 'URL/Link' },
  { value: 'multiselect', label: 'Multiple Select' }
]

// Auto-fill field mappings
const AUTO_FILL_FIELDS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'dateOfBirth', label: 'Date of Birth' },
  { value: 'gender', label: 'Gender' },
  { value: 'nationality', label: 'Nationality' },
  { value: 'school', label: 'School' },
  { value: 'grade', label: 'Grade' },
  { value: 'county', label: 'County' },
  { value: 'homeAddress', label: 'Home Address' },
  { value: 'parentName', label: 'Parent Name' },
  { value: 'parentPhone', label: 'Parent Phone' },
  { value: 'parentEmail', label: 'Parent Email' },
  { value: 'linkedinUrl', label: 'LinkedIn URL' },
  { value: 'githubUrl', label: 'GitHub URL' },
  { value: 'portfolioUrl', label: 'Portfolio URL' }
]

interface FormField {
  id: string
  type: string
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
}

interface ApplicationFormBuilderProps {
  initialData?: ApplicationFormData
  onSave: (data: ApplicationFormData) => Promise<void>
  onCancel: () => void
}

type ViewMode = 'settings' | 'builder' | 'properties'

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
      isActive: false
    }
  )

  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  
  // Mobile view state
  const [activeView, setActiveView] = useState<ViewMode>('builder')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      title: 'New Tab',
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
    
    // Update order
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
        label: 'New Option'
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
      newErrors.tabs = 'At least one tab is required'
    }
    
    formData.tabs.forEach(tab => {
      if (!tab.title) {
        newErrors[`tab-${tab.id}`] = 'Tab title is required'
      }
      if (tab.fields.length === 0) {
        newErrors[`tab-${tab.id}-fields`] = 'Tab must have at least one field'
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
    } finally {
      setSaving(false)
    }
  }

  const currentTab = formData.tabs.find(t => t.id === selectedTab)
  const currentField = currentTab?.fields.find(f => f.id === selectedField)

  return (
    <div className="h-screen bg-muted/20 text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Form Builder</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {initialData ? 'Edit' : 'Create'} application form for {formData.season}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                showPreview 
                  ? 'bg-primary/10 text-primary border-primary' 
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
              }`}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
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
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="flex-none bg-card border-b border-border px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shadow-sm">
          <button
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === 'settings' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveView('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === 'builder' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Layout className="h-4 w-4" />
            Builder
          </button>
          <button
            onClick={() => setActiveView('properties')}
            disabled={!selectedField}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeView === 'properties' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted disabled:opacity-50'
            }`}
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
              <Settings className="h-4 w-4 text-primary" />
              Form Settings
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
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
              </div>
              
              <div className="space-y-1.5">
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
              </div>
              
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
                <div className="space-y-1.5">
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
                </div>
                
                <div className="space-y-1.5">
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
                </div>
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
                <FileText className="h-4 w-4 text-primary" />
                Form Tabs
              </h3>
              
              <button
                onClick={addTab}
                className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-all"
                title="Add Tab"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {errors.tabs && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-500 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  {errors.tabs}
                </p>
              </div>
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
                        <div className={`p-1.5 rounded-md ${selectedTab === tab.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          <span className="text-xs font-bold">{tab.order + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[120px]">{tab.title || 'Untitled Tab'}</p>
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
                      <div className="absolute -right-1 -top-1">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {formData.tabs.length === 0 && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">No tabs yet</p>
                  <button
                    onClick={addTab}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Add your first tab
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
                  placeholder="Tab Title"
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
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
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
                          ? 'border-primary ring-1 ring-primary shadow-md'
                          : 'border-border hover:border-primary/50 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        setSelectedField(field.id)
                        if (isMobile) setActiveView('properties')
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                              {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                            </span>
                            
                            {field.autoFillFrom && (
                              <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                Auto-fill: {AUTO_FILL_FIELDS.find(f => f.value === field.autoFillFrom)?.label}
                              </span>
                            )}
                          </div>
                          
                          {field.helpText && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{field.helpText}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteField(currentTab.id, field.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {(errors[`field-${field.id}`] || errors[`field-${field.id}-options`]) && (
                        <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-500 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          {errors[`field-${field.id}`] || errors[`field-${field.id}-options`]}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {currentTab.fields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card/50">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No fields in this tab</p>
                    <p className="text-sm text-muted-foreground/70 mb-4">Add fields to collect information</p>
                    <button
                      onClick={() => addField(currentTab.id)}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Add your first field
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Layout className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No Tab Selected</h3>
              <p className="text-center max-w-xs">Select a tab from the left sidebar or create a new one to start building your form.</p>
              <button
                onClick={addTab}
                className="mt-6 btn-primary text-white"
              >
                Create New Tab
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Field Settings */}
        <div className={`
          ${isMobile ? (activeView === 'properties' ? 'w-full' : 'hidden') : 'w-80 border-l border-border'} 
          bg-card overflow-y-auto
        `}>
          {currentField && currentTab ? (
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                  Field Properties
                </h3>
                {isMobile && (
                  <button onClick={() => setActiveView('builder')} className="p-1 hover:bg-muted rounded">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</label>
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
                    Automatically populate this field from user profile data
                  </p>
                </div>
                
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
                        className="text-xs text-primary hover:underline font-medium"
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

                {/* Validation Settings */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Validation</h4>
                  
                  <div className="space-y-3">
                    {['text', 'email', 'tel', 'url', 'textarea'].includes(currentField.type) && (
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
                    )}
                    
                    {currentField.type === 'text' && (
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Regex Pattern</label>
                        <input
                          type="text"
                          value={currentField.validation?.pattern || ''}
                          onChange={(e) => updateField(currentTab.id, currentField.id, {
                            validation: { ...currentField.validation, pattern: e.target.value || undefined }
                          })}
                          className="w-full px-2 py-1.5 text-sm bg-background border border-input rounded focus:border-primary outline-none font-mono"
                          placeholder="e.g. ^[A-Z0-9._%+-]+@"
                        />
                      </div>
                    )}
                  </div>
                </div>
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