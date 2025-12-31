'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Settings,
  Save,
  X
} from 'lucide-react'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'radio' | 'checkbox' | 'file' | 'date'
  label: string
  name: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio, checkbox
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  order: number
}

interface ApplicationForm {
  id: string
  name: string
  season: string
  description: string
  isActive: boolean
  fields: FormField[]
  openDate: string
  closeDate: string
  maxApplications?: number
  currentApplications: number
  createdAt: string
  updatedAt: string
  createdBy: {
    email: string
    firstName?: string
    lastName?: string
  }
}

export default function ApplicationFormsManagement() {
  const [forms, setForms] = useState<ApplicationForm[]>([])
  const [selectedForm, setSelectedForm] = useState<ApplicationForm | null>(null)
  const [editingForm, setEditingForm] = useState<ApplicationForm | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeFormId, setActiveFormId] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
    fetchActiveForm()
  }, [])

  const fetchForms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/applications/forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data.data?.forms || [])
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveForm = async () => {
    try {
      const response = await fetch('/api/admin/applications/forms/active')
      if (response.ok) {
        const data = await response.json()
        setActiveFormId(data.data?.formId || null)
      }
    } catch (error) {
      console.error('Failed to fetch active form:', error)
    }
  }

  const handleActivateForm = async (formId: string) => {
    if (!confirm('This will deactivate all other forms. Continue?')) return

    try {
      await fetch(`/api/admin/applications/forms/${formId}/activate`, {
        method: 'POST'
      })
      fetchForms()
      fetchActiveForm()
    } catch (error) {
      console.error('Failed to activate form:', error)
    }
  }

  const handleDuplicateForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/admin/applications/forms/${formId}/duplicate`, {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setEditingForm(data.data?.form)
        fetchForms()
      }
    } catch (error) {
      console.error('Failed to duplicate form:', error)
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure? This will delete all applications using this form.')) return

    try {
      await fetch(`/api/admin/applications/forms/${formId}`, {
        method: 'DELETE'
      })
      fetchForms()
      if (selectedForm?.id === formId) {
        setSelectedForm(null)
      }
    } catch (error) {
      console.error('Failed to delete form:', error)
    }
  }

  const handleSaveForm = async (formData: Partial<ApplicationForm>) => {
    try {
      const url = editingForm 
        ? `/api/admin/applications/forms/${editingForm.id}`
        : '/api/admin/applications/forms'
      
      const method = editingForm ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchForms()
        setEditingForm(null)
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Failed to save form:', error)
    }
  }

  const FormBuilder = ({ form, onSave }: { form: ApplicationForm | null; onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState<Partial<ApplicationForm>>(
      form || {
        name: '',
        season: 'FGC2025',
        description: '',
        isActive: false,
        fields: [],
        openDate: '',
        closeDate: '',
        maxApplications: undefined
      }
    )
    const [fields, setFields] = useState<FormField[]>(form?.fields || [])

    const fieldTypes = [
      { value: 'text', label: 'Text Input' },
      { value: 'textarea', label: 'Text Area' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'select', label: 'Dropdown' },
      { value: 'radio', label: 'Radio Buttons' },
      { value: 'checkbox', label: 'Checkboxes' },
      { value: 'file', label: 'File Upload' },
      { value: 'date', label: 'Date Picker' }
    ]

    const addField = () => {
      const newField: FormField = {
        id: `field-${Date.now()}`,
        type: 'text',
        label: 'New Field',
        name: `field_${fields.length + 1}`,
        required: false,
        order: fields.length
      }
      setFields([...fields, newField])
    }

    const updateField = (index: number, updates: Partial<FormField>) => {
      const updatedFields = [...fields]
      updatedFields[index] = { ...updatedFields[index], ...updates }
      setFields(updatedFields)
    }

    const removeField = (index: number) => {
      setFields(fields.filter((_, i) => i !== index))
    }

    const moveField = (index: number, direction: 'up' | 'down') => {
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === fields.length - 1)
      ) {
        return
      }

      const newFields = [...fields]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      const temp = newFields[index]
      newFields[index] = newFields[targetIndex]
      newFields[targetIndex] = temp

      // Update order
      newFields.forEach((field, i) => {
        field.order = i
      })

      setFields(newFields)
    }

    const handleSubmit = () => {
      onSave({
        ...formData,
        fields
      })
    }

    return (
      <div className="space-y-6">
        {/* Form Settings */}
        <div className="bg-card p-4 rounded-lg border space-y-4">
          <h3 className="font-semibold">Form Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Form Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., FGC 2025 Application"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Season</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="FGC2025">FGC2025</option>
                <option value="FGC2026">FGC2026</option>
                <option value="FGC2027">FGC2027</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Describe this application form..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Open Date</label>
              <input
                type="datetime-local"
                value={formData.openDate}
                onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Close Date</label>
              <input
                type="datetime-local"
                value={formData.closeDate}
                onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Max Applications (leave empty for unlimited)
            </label>
            <input
              type="number"
              value={formData.maxApplications || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                maxApplications: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 100"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-card p-4 rounded-lg border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Form Fields</h3>
            <button
              onClick={addField}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>No fields added yet</p>
              <button
                onClick={addField}
                className="mt-2 text-primary hover:underline"
              >
                Add your first field
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <span className="font-medium">Field {index + 1}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveField(index, 'down')}
                        disabled={index === fields.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeField(index)}
                        className="p-1 hover:bg-muted rounded text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Field Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value as any })}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Field Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="field_name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Field Label"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Enter placeholder text..."
                    />
                  </div>

                  {['select', 'radio', 'checkbox'].includes(field.type) && (
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={field.options?.join('\n') || ''}
                        onChange={(e) => updateField(index, { 
                          options: e.target.value.split('\n').filter(o => o.trim()) 
                        })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={3}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    <label htmlFor={`required-${field.id}`} className="text-sm">
                      Required field
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setEditingForm(null)
              setShowCreateModal(false)
            }}
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Form
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application Forms</h1>
          <p className="text-muted-foreground">Create and manage application forms</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Form
        </button>
      </div>

      {/* Active Form Alert */}
      {activeFormId && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Active Form: {forms.find(f => f.id === activeFormId)?.name}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                This form is currently accepting applications
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : forms.length === 0 ? (
          <div className="col-span-full bg-card rounded-lg border p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No forms created yet</p>
          </div>
        ) : (
          forms.map((form) => (
            <div
              key={form.id}
              className={`bg-card rounded-lg border p-4 ${
                form.id === activeFormId ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{form.name}</h3>
                  <p className="text-sm text-muted-foreground">{form.season}</p>
                </div>
                {form.id === activeFormId ? (
                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Active
                  </div>
                ) : form.isActive ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {form.description}
              </p>

              <div className="space-y-2 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(form.openDate).toLocaleDateString()} - {new Date(form.closeDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>{form.fields.length} fields</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>
                    {form.currentApplications} / {form.maxApplications || '∞'} applications
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedForm(form)}
                  className="flex-1 px-2 py-1 border rounded text-sm hover:bg-muted"
                >
                  <Eye className="inline h-3 w-3 mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setEditingForm(form)}
                  className="flex-1 px-2 py-1 border rounded text-sm hover:bg-muted"
                >
                  <Edit className="inline h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicateForm(form.id)}
                  className="p-1 border rounded hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {form.id !== activeFormId && (
                  <button
                    onClick={() => handleActivateForm(form.id)}
                    className="p-1 border rounded hover:bg-muted text-primary"
                  >
                    <ToggleRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingForm) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingForm ? `Edit Form: ${editingForm.name}` : 'Create Application Form'}
                </h2>
                <button
                  onClick={() => {
                    setEditingForm(null)
                    setShowCreateModal(false)
                  }}
                  className="p-2 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <FormBuilder
                form={editingForm}
                onSave={handleSaveForm}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      {selectedForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedForm(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Form Preview: {selectedForm.name}</h2>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-2 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-4">
              {selectedForm.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border rounded-lg"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'email' && (
                    <input
                      type="email"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border rounded-lg"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'phone' && (
                    <input
                      type="tel"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border rounded-lg"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'date' && (
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      required={field.required}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options?.map(option => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={field.name}
                            value={option}
                            required={field.required}
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="space-y-2">
                      {field.options?.map(option => (
                        <label key={option} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name={field.name}
                            value={option}
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'file' && (
                    <input
                      type="file"
                      className="w-full px-3 py-2 border rounded-lg"
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    alert('This is just a preview!')
                  }}
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
