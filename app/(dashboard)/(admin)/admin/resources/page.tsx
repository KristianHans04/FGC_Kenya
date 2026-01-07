'use client'

import { useState, useEffect } from 'react'
import { 
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react'
import { useFlashNotification } from '@/app/lib/hooks/useFlashNotification'
import ResourceForm from '@/app/components/admin/ResourceForm'

interface Resource {
  id: string
  slug: string
  title: string
  description?: string
  link: string
  cohort: string
  isActive: boolean
  createdAt: string
  createdBy: {
    firstName?: string
    lastName?: string
    role: string
  }
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('all')
  const [availableCohorts, setAvailableCohorts] = useState<string[]>([])
  
  const { addNotification } = useFlashNotification()

  useEffect(() => {
    document.title = 'Learning Resources | Admin Dashboard'
    fetchResources()
    fetchCohorts()
  }, [])

  const fetchResources = async (cohort?: string) => {
    try {
      const url = cohort && cohort !== 'all' 
        ? `/api/admin/resources?cohort=${cohort}`
        : '/api/admin/resources'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResources(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      addNotification('Failed to load resources', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCohorts = async () => {
    try {
      // Get unique cohorts from existing resources or cohort members
      const response = await fetch('/api/admin/applications/calls')
      if (response.ok) {
        const data = await response.json()
        const cohorts = data.data?.map((call: any) => call.season) || []
        setAvailableCohorts(['FGC2025', 'FGC2024', 'FGC2023', ...cohorts].filter((v, i, a) => a.indexOf(v) === i))
      }
    } catch (error) {
      console.error('Failed to fetch cohorts:', error)
    }
  }

  const handleCohortChange = (cohort: string) => {
    setSelectedCohort(cohort)
    fetchResources(cohort)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        addNotification('Resource deleted successfully', 'success')
        fetchResources(selectedCohort)
      } else {
        addNotification('Failed to delete resource', 'error')
      }
    } catch (error) {
      console.error('Failed to delete resource:', error)
      addNotification('Failed to delete resource', 'error')
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingResource(null)
    fetchResources(selectedCohort)
  }

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
        <p className="text-muted-foreground">
          Manage learning resources for different cohorts
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>
          
          <select
            value={selectedCohort}
            onChange={(e) => handleCohortChange(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="all">All Cohorts</option>
            {availableCohorts.map(cohort => (
              <option key={cohort} value={cohort}>{cohort}</option>
            ))}
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No resources found matching your search' : 'No resources available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <div key={resource.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg line-clamp-2">{resource.title}</h3>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  {resource.cohort}
                </span>
              </div>
              
              {resource.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Resource
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>
                    {resource.createdBy.firstName || 'Unknown'} ({resource.createdBy.role})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => handleEdit(resource)}
                  className="flex-1 px-3 py-1 bg-muted rounded hover:bg-muted/80 flex items-center justify-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Form Modal */}
      {showForm && (
        <ResourceForm
          resource={editingResource}
          cohorts={availableCohorts}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose()
            addNotification(
              editingResource ? 'Resource updated successfully' : 'Resource created successfully',
              'success'
            )
          }}
        />
      )}
    </div>
  )
}