'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, ExternalLink, Loader2, BookOpen, Calendar, Users, Search } from 'lucide-react'
import ResourceFormModal from '@/app/components/admin/ResourceFormModal'

interface LearningResource {
  id: string
  slug: string
  title: string
  description?: string
  link: string
  cohort: string
  isActive: boolean
  createdAt: string
  createdById: string
  createdBy: {
    firstName?: string
    lastName?: string
    role: string
  }
}

interface MentorCohort {
  cohort: string
  studentCount?: number
}

export default function MentorLearningResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [mentorCohorts, setMentorCohorts] = useState<MentorCohort[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null)
  const [selectedCohort, setSelectedCohort] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    document.title = 'Learning Resources | Mentor Dashboard'
    fetchMentorData()
  }, [])

  useEffect(() => {
    if (mentorCohorts.length > 0) {
      fetchResources()
    }
  }, [selectedCohort, mentorCohorts])

  const fetchMentorData = async () => {
    try {
      // Fetch mentor's cohorts
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setCurrentUserId(data.data?.id || '')
        
        // Fetch cohorts where user is a mentor
        const cohortsResponse = await fetch('/api/mentor/cohorts')
        if (cohortsResponse.ok) {
          const cohortsData = await cohortsResponse.json()
          setMentorCohorts(cohortsData.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch mentor data:', error)
    }
  }

  const fetchResources = async () => {
    try {
      setLoading(true)
      const url = selectedCohort === 'all' 
        ? '/api/admin/resources'
        : `/api/admin/resources?cohort=${selectedCohort}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setResources(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (resource: LearningResource) => {
    // Mentors can only edit their own resources
    if (resource.createdById === currentUserId) {
      setEditingResource(resource)
      setShowModal(true)
    }
  }

  const handleCreate = () => {
    setEditingResource(null)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingResource(null)
    fetchResources()
  }

  // Filter resources based on search
  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.cohort.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group resources by cohort
  const resourcesByCohort = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.cohort]) {
      acc[resource.cohort] = []
    }
    acc[resource.cohort].push(resource)
    return acc
  }, {} as Record<string, LearningResource[]>)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
        <p className="text-muted-foreground">
          Manage learning materials for your cohorts
        </p>
      </div>

      {/* Cohort Info */}
      {mentorCohorts.length > 0 && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            You are mentoring: <strong>{mentorCohorts.map(c => c.cohort).join(', ')}</strong>
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-lg"
          />
        </div>
        
        <select
          value={selectedCohort}
          onChange={(e) => setSelectedCohort(e.target.value)}
          className="px-4 py-2 bg-card border rounded-lg"
        >
          <option value="all">All My Cohorts</option>
          {mentorCohorts.map(cohort => (
            <option key={cohort.cohort} value={cohort.cohort}>
              {cohort.cohort}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </button>
      </div>

      {/* Resources List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Start by adding learning resources for your students'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Add First Resource
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(resourcesByCohort).map(([cohort, cohortResources]) => (
            <div key={cohort}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {cohort}
              </h3>
              <div className="grid gap-3">
                {cohortResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-card rounded-lg border p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium mb-1">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                By {resource.createdBy.firstName} {resource.createdBy.lastName}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(resource.createdAt).toLocaleDateString()}
                              </span>
                              {resource.createdById === currentUserId && (
                                <>
                                  <span>•</span>
                                  <span className="text-primary">Your resource</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-muted rounded-lg"
                          title="Open resource"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {resource.createdById === currentUserId && (
                          <button
                            onClick={() => handleEdit(resource)}
                            className="p-2 hover:bg-muted rounded-lg"
                            title="Edit resource"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Form Modal */}
      {showModal && (
        <ResourceFormModal
          resource={editingResource}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}